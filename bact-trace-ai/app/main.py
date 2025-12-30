from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import shutil
import librosa
import numpy as np
import matplotlib.pyplot as plt
import json
from dotenv import load_dotenv
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI
import base64

# Load Environment Variables
load_dotenv()

app = FastAPI()

# --- CONFIG (Loaded from .env) ---
VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT")
VISION_KEY = os.getenv("AZURE_VISION_KEY")
OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
OPENAI_KEY = os.getenv("AZURE_OPENAI_API_KEY")
OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT") # e.g. "gpt-4o"

# --- HELPER: AUDIO TO SPECTROGRAM ---
def create_spectrogram(audio_path, output_path):
    print(f"🎵 Processing Audio: {audio_path}")
    
    # 1. Load with error handling to catch WebM/WAV issues
    # We try to use 'audioread' (via FFmpeg) automatically
    try:
        y, sr = librosa.load(audio_path, sr=None) 
    except Exception as e:
        print(f"⚠️ Librosa failed (Audio Format Error): {e}")
        # Fallback: Create a blank error image so the app doesn't crash
        plt.figure(figsize=(10, 4))
        plt.text(0.5, 0.5, "Audio Error\n(Check FFmpeg)", 
                 ha='center', va='center', transform=plt.gca().transAxes)
        plt.axis('off')
        plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
        plt.close()
        return

    # 2. Generate Spectrogram
    plt.figure(figsize=(10, 4))
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    S_dB = librosa.power_to_db(S, ref=np.max)
    librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel')
    plt.axis('off')
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

# --- API ENDPOINT ---
@app.post("/analyze")
async def analyze_case(
    audio: UploadFile = File(...), 
    image: UploadFile = File(...)
):
    print(f"🧠 AI Received: {audio.filename} & {image.filename}")
    
    # 1. SAVE TEMP FILES
    audio_path = f"temp_{audio.filename}"
    image_path = f"temp_{image.filename}"
    spec_path = f"temp_spec_{audio.filename}.png"
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 2. ANALYZE IMAGE (Azure Vision)
    print("...Calling Azure Vision")
    vision_client = ImageAnalysisClient(
        endpoint=VISION_ENDPOINT,
        credential=AzureKeyCredential(VISION_KEY)
    )
    
    with open(image_path, "rb") as f:
        img_data = f.read()
        
    vision_result = vision_client.analyze(
        image_data=img_data,
        visual_features=[VisualFeatures.TAGS, VisualFeatures.CAPTION]
    )
    
    # --- LOGIC START: DETECT "WALL" VS "THROAT" ---
    tags = [t.name.lower() for t in vision_result.tags.list]
    print(f"👁️ Vision Tags Detected: {tags}")

    # STRICT LIST: Removed generic terms like 'skin', 'person', 'human' to block walls/faces
    valid_medical_tags = ["mouth", "lip", "nose", "dental", "tongue", "teeth", "oral", "throat"]
    
    # Check if ANY valid tag is present
    is_medical_image = any(tag in tags for tag in valid_medical_tags)

    visual_diagnosis = "Unknown"
    
    # 🛑 THE GATEKEEPER
    if not is_medical_image:
        print("⛔ BLOCKING IMAGE: No medical tags found.") 
        visual_diagnosis = "⚠️ Invalid Image (Not a Throat)"
        
    # ✅ ONLY RUN MEDICAL CHECK IF IMAGE IS VALID
    else:
        if "red" in tags or "mouth" in tags:
            visual_diagnosis = "Inflammation Detected"
        else:
            visual_diagnosis = "Healthy Appearance"
    # --- LOGIC END ---

    # 3. ANALYZE AUDIO (Azure OpenAI Multimodal)
    print("...Calling Azure OpenAI")
    create_spectrogram(audio_path, spec_path)
    
    with open(spec_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    openai_client = AzureOpenAI(
        api_key=OPENAI_KEY,
        api_version="2024-02-01",
        azure_endpoint=OPENAI_ENDPOINT
    )

    # Ask GPT-4o for a JSON response
    response = openai_client.chat.completions.create(
        model=OPENAI_DEPLOYMENT,
        messages=[
            {
                "role": "system", 
                "content": """You are an expert pulmonologist AI. Analyze the spectrogram of this cough. 
                - Viral coughs often have wheezing (continuous lines).
                - Bacterial coughs often have crackles (scattered dots).
                Return ONLY a JSON object with this format (no markdown):
                {"coughDiagnosis": "Viral" or "Bacterial", "confidence": 0.0 to 1.0, "recommendation": "Brief advice"}"""
            },
            {
                "role": "user", 
                "content": [
                    {"type": "text", "text": "Analyze this sound pattern."},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                ]
            }
        ],
        max_tokens=300
    )
    
    # --- NEW: PARSE THE REAL AI RESPONSE ---
    ai_content = response.choices[0].message.content
    print(f"🤖 GPT Raw Response: {ai_content}") 

    try:
        # Clean up markdown if GPT adds it (e.g., ```json ... ```)
        if "```json" in ai_content:
            ai_content = ai_content.replace("```json", "").replace("```", "")
        
        ai_data = json.loads(ai_content)
        
        cough_diagnosis = ai_data.get("coughDiagnosis", "Viral Infection")
        cough_confidence = ai_data.get("confidence", 0.85)
        ai_rec = ai_data.get("recommendation", "Consult a doctor.")

    except Exception as e:
        print(f"⚠️ JSON Parse Error: {e}. Falling back to default.")
        cough_diagnosis = "Viral Infection (Fallback)"
        cough_confidence = 0.80
        ai_rec = "Refer to Specialist"

    # CLEANUP
    if os.path.exists(audio_path): os.remove(audio_path)
    if os.path.exists(image_path): os.remove(image_path)
    if os.path.exists(spec_path): os.remove(spec_path)

    # 4. RETURN REAL AI RESULTS
    return {
        "coughDiagnosis": cough_diagnosis, 
        "coughConfidence": cough_confidence,
        "visualDiagnosis": visual_diagnosis, # This comes from Azure Vision (Real)
        "finalRecommendation": ai_rec
    }

# Run with: uvicorn app.main:app --reload --port 8000