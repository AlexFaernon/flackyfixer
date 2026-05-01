import requests
import base64


class GitHubCodeRetriever:
    def __init__(self, owner: str, repo: str, token: str, branch: str = "main"):
        self.owner = owner
        self.repo = repo
        self.branch = branch
        self.token = token

    def get_file(self, path: str) -> str:
        url = f"https://api.github.com/repos/{self.owner}/{self.repo}/contents/{path}"

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }

        params = {
            "ref": self.branch
        }

        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            raise Exception(f"GitHub API error: {response.text}")

        data = response.json()

        content_base64 = data["content"]
        content_bytes = base64.b64decode(content_base64)

        return content_bytes.decode("utf-8")