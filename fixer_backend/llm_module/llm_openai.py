import json

from openai import OpenAI
from .llm_base import BaseLLM

class OpenAILLM(BaseLLM):
    prompt = """
Ты опытный QA-инженер и backend-разработчик.

Твоя задача — проанализировать падающий автоматизированный тест, определить наиболее вероятную причину ошибки и предложить способ её исправления.

Внимательно изучи код теста и сообщение об ошибке.

Код теста:
----------------
{test_code}
----------------

Ошибка (stacktrace):
----------------
{stacktrace}
----------------

Верни результат СТРОГО в формате JSON. 
Не добавляй никакого текста вне JSON.

Формат ответа:
{{
  "root_cause": "Краткое объяснение причины падения теста",
  "failure_type": "Тип проблемы (например: race condition, timing issue, внешняя зависимость, ошибка assert, проблема окружения и т.д.)",
  "suggested_fix": "Конкретные рекомендации по исправлению",
  "example": "Пример исправленного кода (если применимо, иначе пустая строка)"
}}

Требования:
- Отвечай кратко и по делу
- Не повторяй входные данные
- Если причин несколько — укажи наиболее вероятную
- Если пример кода не нужен — верни пустую строку в поле example"""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate(self, stacktrace: str, code: str) -> dict:
        format_prompt = self.prompt.format(stacktrace=stacktrace, test_code=code)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": format_prompt}
            ]
        )
        json_response = json.loads(response.choices[0].message.content)
        return json_response