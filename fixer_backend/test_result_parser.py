import xml.etree.ElementTree as ET
import re

tree = ET.parse("test.xml")
root = tree.getroot()

def parse_xml():
    for testcase in root.iter("testcase"):
        name = testcase.attrib.get("name")
        failure = testcase.find("failure")

        if failure is not None:
            yield name, failure.text

def extract_file_name_from_stacktrace(stacktrace: str) -> str | None:
    match = re.search(r'File "(.+?)"', stacktrace)
    return match.group(1) if match else None