import os
from dotenv import load_dotenv

load_dotenv()

open_ai_key = os.getenv("OPENAI_API_KEY")
llm_provider = os.getenv("LLM_PROVIDER")

github_key = os.getenv("GITHUB_TOKEN")
github_owner = os.getenv("GITHUB_OWNER")
github_repo = os.getenv("GITHUB_REPO")

postgres_url = os.getenv("POSTGRES_URL")
