import json

from openai import OpenAI
from .llm_base import BaseLLM

class OpenAILLM(BaseLLM):

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate(self, stacktrace: str, code: str, additional_context: str) -> dict:
        format_prompt = self._prompt.format(stacktrace=stacktrace, test_code=code, additional_context=additional_context)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": format_prompt}
            ]
        )
        json_response = json.loads(response.choices[0].message.content)
        return json_response