from llm_module.llm_base import BaseLLM
from llm_module.llm_openai import OpenAILLM
from llm_module.llm_ollama import LocalLLM

from config import llm_provider, open_ai_key

def get_llm() -> BaseLLM:
    if llm_provider == "openai":
        return OpenAILLM(open_ai_key)
    elif llm_provider == "local":
        return LocalLLM()

    raise ValueError("Invalid llm provider")