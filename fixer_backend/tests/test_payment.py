import time

def wait_for_payment():
    time.sleep(2)
    raise TimeoutError("Payment service did not respond")


def test_payment_processing():
    wait_for_payment()