import test_result_parser
from code_retrieval import GitHubCodeRetriever
from llm_module.llm_openai import OpenAILLM

from config import github_key, open_ai_key

retriever = GitHubCodeRetriever(
    owner="AlexFaernon",
    repo="flackyfixer",
    token=github_key
)

openai = OpenAILLM(open_ai_key)

for name, failure in test_result_parser.parse_xml():
    file_name = test_result_parser.extract_file_name_from_stacktrace(failure)
    code = retriever.get_file(file_name)
    print(openai.generate(failure, code))
