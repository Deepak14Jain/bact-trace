from fastapi import FastAPI, UploadFile, File, Form, HTTPException
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
    try:
        y, sr = librosa.load(audio_path, sr=None) 
    except Exception as e:
        print(f"⚠️ Librosa failed (Audio Format Error): {e}")
        # Fallback error image
        plt.figure(figsize=(10, 4))
        plt.text(0.5, 0.5, "Audio Error", ha='center', va='center')
        plt.axis('off')
        plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
        plt.close()
        return

    # Generate Spectrogram
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
    image: UploadFile = File(...),
    # --- NEW: ROBUST AI INPUTS ---
    age: str = Form(...),
    temperature: str = Form("98.6"),
    symptomsDays: str = Form("1"),
    hasPhlegm: str = Form("No"),
    breathingDifficulty: str = Form("No")
    # -----------------------------
):
    print(f"🧠 AI Processing Case for Age: {age}, Temp: {temperature}F")
    
    # 1. SAVE TEMP FILES
    audio_path = f"temp_{audio.filename}"
    image_path = f"temp_{image.filename}"
    spec_path = f"temp_spec_{audio.filename}.png"
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 2. ANALYZE IMAGE (Azure Vision - The Gatekeeper)
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
    
    tags = [t.name.lower() for t in vision_result.tags.list]
    print(f"👁️ Vision Tags: {tags}")

    # LOGIC: Check for valid throat/mouth image
    valid_medical_tags = ["mouth", "lip", "nose", "dental", "tongue", "teeth", "oral", "throat", "face"]
    is_medical_image = any(tag in tags for tag in valid_medical_tags)

    visual_diagnosis = "Unknown"
    visual_notes = vision_result.caption.text if vision_result.caption else "No description"
    
    if not is_medical_image:
        print("⛔ BLOCKING IMAGE: No medical tags found.") 
        visual_diagnosis = "⚠️ Invalid Image (Not a Throat)"
    else:
        if "red" in tags or "inflammation" in tags or "sore" in tags:
            visual_diagnosis = "Visible Inflammation"
        else:
            visual_diagnosis = "Healthy Appearance"

    # 3. ANALYZE AUDIO & CONTEXT (Azure OpenAI - The Medical Brain)
    print("...Calling Azure OpenAI (Multimodal)")
    create_spectrogram(audio_path, spec_path)
    
    with open(spec_path, "rb") as image_file:
        base64_spec = base64.b64encode(image_file.read()).decode('utf-8')

    openai_client = AzureOpenAI(
        api_key=OPENAI_KEY,
        api_version="2024-02-01",
        azure_endpoint=OPENAI_ENDPOINT
    )

    # --- THE ROBUST AI PROMPT --- 
    system_prompt = """
    You are an expert Infectious Disease Specialist. Your job is Antibiotic Stewardship.
    Analyze the Patient Vitals + Audio Spectrogram + Visual Report to recommend treatment.
    
    DECISION RULES:
    1. VIRAL (Likely): Low Fever (<100F), Short Duration (<5 days), Clear/No Phlegm, Spectrogram shows wheezing. -> REC: "Supportive Care Only (No Antibiotics)"
    2. BACTERIAL (Likely): High Fever (>101F), Colored Phlegm, Spectrogram shows crackles. -> REC: "Antibiotics Recommended"
    3. DANGER SIGNS: Breathing Difficulty = "Yes". -> REC: "URGENT REFERRAL TO HOSPITAL"
    4. CHRONIC: Duration > 14 Days. -> REC: "Refer for TB Testing"
    
    Return ONLY JSON:
    {"coughDiagnosis": "Viral" or "Bacterial" or "TB Suspected", "confidence": 0.0-1.0, "recommendation": "Specific advice based on rules."}
    """

    user_context = f"""
    PATIENT VITALS:
    - Age: {age}
    - Temperature: {temperature}°F
    - Duration: {symptomsDays} days
    - Phlegm: {hasPhlegm}
    - Breathing Difficulty: {breathingDifficulty}
    
    VISUAL ANALYSIS:
    - Findings: {visual_diagnosis}
    - Description: {visual_notes}
    
    Analyze the attached Spectrogram image in context of these vitals.
    """

    response = openai_client.chat.completions.create(
        model=OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user", 
                "content": [
                    {"type": "text", "text": user_context},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_spec}"}}
                ]
            }
        ],
        max_tokens=400
    )
    
    # --- PARSE RESPONSE ---
    ai_content = response.choices[0].message.content
    print(f"🤖 GPT Reasoning: {ai_content}") 

    try:
        if "```json" in ai_content:
            ai_content = ai_content.replace("```json", "").replace("```", "")
        
        ai_data = json.loads(ai_content)
        
        cough_diagnosis = ai_data.get("coughDiagnosis", "Viral Infection")
        cough_confidence = ai_data.get("confidence", 0.0)
        ai_rec = ai_data.get("recommendation", "Consult a doctor.")

    except Exception as e:
        print(f"⚠️ JSON Parse Error: {e}")
        cough_diagnosis = "Analysis Error"
        cough_confidence = 0.0
        ai_rec = "Please consult a doctor manually."

    # CLEANUP
    if os.path.exists(audio_path): os.remove(audio_path)
    if os.path.exists(image_path): os.remove(image_path)
    if os.path.exists(spec_path): os.remove(spec_path)

    # 4. RETURN FINAL RESULT
    return {
        "coughDiagnosis": cough_diagnosis, 
        "coughConfidence": cough_confidence,
        "visualDiagnosis": visual_diagnosis, 
        "finalRecommendation": ai_rec
    }