from openai import OpenAI
from llm_base import BaseLLM

class OpenAILLM(BaseLLM):
    prompt = """
You are an experienced QA and software engineer.
Your task is to analyze a failing automated test and suggest possible reasons for the failure and how to fix it.
Analyze the provided test code and error message carefully.

Test code:
----------------
{code}
----------------

Error (stacktrace):
----------------
{stacktrace}
----------------

Please provide your answer in the following structured format:

1. Root cause:
Briefly explain the most likely reason why the test is failing.

2. Failure type:
Classify the issue (e.g. timing issue, race condition, external dependency, assertion error, environment issue, etc.)

3. Suggested fix:
Provide clear and practical recommendations on how to fix the test.

4. Example fix (optional):
If possible, provide a short code example demonstrating the fix.

Important:
- Do not repeat the input.
- Be concise and technical.
- If multiple causes are possible, mention the most probable one."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate(self, stacktrace: str, code: str) -> str:
        format_prompt = self.prompt.format(stacktrace=stacktrace, code=code)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": format_prompt}
            ]
        )
        return response.choices[0].message.content