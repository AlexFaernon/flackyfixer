import requests


def test_payment_processing():
    response = requests.post(
        "http://payment-service/process",
        json={"amount": 100}
    )

    # сервис иногда долго отвечает или падает
    assert response.status_code == 200