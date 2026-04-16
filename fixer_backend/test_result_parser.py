import xml.etree.ElementTree as ET

tree = ET.parse("test.xml")
root = tree.getroot()

for testcase in root.iter("testcase"):
    name = testcase.attrib.get("name")
    failure = testcase.find("failure")

    if failure is not None:
        print(name)
        print(failure.text)

