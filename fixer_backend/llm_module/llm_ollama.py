import json

from openai import OpenAI
from .llm_base import BaseLLM

class LocalLLM(BaseLLM):
    def __init__(self, model: str = "llama3"):
        self.client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="-"
        )
        self.model = model

    def generate(self, stacktrace: str, code: str) -> dict:
        format_prompt = self.__prompt.format(stacktrace=stacktrace, test_code=code)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": format_prompt}
            ],
            temperature=0.2
        )

        json_response = json.loads(response.choices[0].message.content)
        return json_response