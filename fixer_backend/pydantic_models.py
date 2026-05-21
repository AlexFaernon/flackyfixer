from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    additional_context: str | None = None