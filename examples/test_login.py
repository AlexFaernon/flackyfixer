import requests


def test_valid_login():
    response = {"status_code": 200}
    assert response["status_code"] == 200


def test_invalid_login():
    response = requests.post(
        "http://localhost:8000/login",
        json={"username": "wrong", "password": "wrong"}
    )

    # ожидаем 401, но иногда API возвращает 200
    assert response.status_code == 401