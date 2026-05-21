from selenium import webdriver
from selenium.webdriver.common.by import By


def test_update_profile():
    driver = webdriver.Chrome()
    driver.get("http://localhost:3000/profile")

    # элемент может появляться с задержкой
    button = driver.find_element(By.ID, "save-button")
    button.click()

    success = driver.find_element(By.ID, "success-message")
    assert success.is_displayed()