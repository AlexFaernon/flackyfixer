import os
from dotenv import load_dotenv

load_dotenv()

open_ai_key = os.getenv("OPENAI_API_KEY")
github_key = os.getenv("GITHUB_TOKEN")