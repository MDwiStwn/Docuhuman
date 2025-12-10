import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

print(f"Library version: {genai.__version__}")

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("No API Key found")
else:
    genai.configure(api_key=api_key)
    print("Available models:")
    try:
        with open("available_models.txt", "w") as f:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"MODEL: {m.name}")
                    f.write(f"{m.name}\n")
    except Exception as e:
        print(f"Error: {e}")
