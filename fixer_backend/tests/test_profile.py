class FakeDriver:
    def find_element(self):
        raise Exception("NoSuchElementException: element not found")


def test_update_profile():
    driver = FakeDriver()
    driver.find_element()