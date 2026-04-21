from abc import ABC, abstractmethod


class BaseLLM(ABC):

    @abstractmethod
    def generate(self, stacktrace: str, code: str) -> str:
        pass