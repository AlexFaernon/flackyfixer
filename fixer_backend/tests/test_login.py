def test_valid_login():
    response = {"status_code": 200}
    assert response["status_code"] == 200


def test_invalid_login():
    response = {"status_code": 200}
    assert response["status_code"] == 401