import json
import time
import random
from deep_translator import GoogleTranslator

# --- 1. LANGUAGES CONFIGURATION ---
INDIAN_LANGS = {
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi'
}

GLOBAL_LANGS = {
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh-CN': 'Chinese (Simplified)', # Note: deep-translator uses zh-CN
    'ar': 'Arabic',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese'
}

# Merge them
TARGET_LANGS = {**INDIAN_LANGS, **GLOBAL_LANGS}

# --- 2. SOURCE TEXT (English) ---
source_text = {
    "nav": {
        "surveillance": "National Surveillance",
        "launch": "Launch Dashboard",
        "title": "Bact-Trace"
    },
    "hero": {
        "badge": "Official Imagine Cup Entry",
        "title": "Stop the Superbugs.",
        "subtitle": "Before they start.",
        "desc": "Bact-Trace is the world's first Multimodal AI Surveillance System designed to distinguish viral vs. bacterial infections in rural populations.",
        "btn_deploy": "Deploy Solution",
        "btn_map": "View Live Map"
    },
    "stats": {
        "deaths": "Annual deaths by 2050 due to AMR.",
        "unnecessary": "Antibiotics prescribed in rural areas are unnecessary.",
        "cost": "Projected cost to the global economy."
    },
    "solution": {
        "title": "Not just an app.",
        "subtitle": "A Decision Engine.",
        "desc": "We don't guess. We combine Audio Spectrograms, Visual Imaging, and Clinical Vitals to give field workers a lab-grade triage tool.",
        "feature1": "Acoustic Biomarkers",
        "feature1_desc": "Detects lung sounds (crackles vs. wheezes) using Azure AI.",
        "feature2": "Clinical Context Fusion",
        "feature2_desc": "Combines fever trends to rule out viral flu instantly.",
        "feature3": "Geospatial Tracking",
        "feature3_desc": "Live heatmaps alert governments to hotspots in real-time."
    }
}

# --- 3. ROBUST TRANSLATION FUNCTION ---
def translate_text_with_retry(text, dest_lang, retries=3):
    """
    Tries to translate text. If it fails, waits and tries again.
    """
    for attempt in range(retries):
        try:
            # Random delay to be polite to the server
            time.sleep(random.uniform(0.2, 0.8))
            
            # Using GoogleTranslator from deep_translator
            translator = GoogleTranslator(source='auto', target=dest_lang)
            return translator.translate(text)
        except Exception as e:
            if attempt < retries - 1:
                wait_time = (attempt + 1) * 2
                print(f"   ⚠️ Rate limited on '{dest_lang}'. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"   ❌ Failed to translate to {dest_lang}: {e}")
                return text # Return English as fallback

def translate_recursive(data, dest_lang):
    if isinstance(data, dict):
        return {k: translate_recursive(v, dest_lang) for k, v in data.items()}
    elif isinstance(data, str):
        return translate_text_with_retry(data, dest_lang)
    return data

# --- 4. EXECUTION ---
def main():
    final_output = {"en": {"translation": source_text, "label": "English"}}

    print(f"🚀 Starting Engine for {len(TARGET_LANGS)} languages...")
    print("   (This might take 2-3 minutes due to safety delays)")

    for code, name in TARGET_LANGS.items():
        print(f"   ... Generating {name} ({code}) ...")
        
        translated_data = translate_recursive(source_text, code)
        
        final_output[code] = {
            "translation": translated_data,
            "label": name
        }

    # Save to file
    with open("bact-trace-web/src/locales.json", "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)

    print("\n✅ SUCCESS! Saved to bact-trace-web/src/locales.json")

if __name__ == "__main__":
    main()