import xml.etree.ElementTree as ET
import re
from dataclasses import dataclass
from typing import Optional

@dataclass
class ParsedTest:
    id: str
    name: str
    classname: str
    status: str
    stacktrace: Optional[str]


def parse_xml(file) -> list[ParsedTest]:
    tree = ET.parse(file.file)
    root = tree.getroot()
    tests = []

    for testcase in root.iter("testcase"):
        name = testcase.attrib.get("name")
        classname = testcase.attrib.get("classname")

        failure = testcase.find("failure")
        error = testcase.find("error")

        status = "passed"
        stacktrace = None

        if failure is not None:
            status = "failed"
            stacktrace = failure.text
        elif error is not None:
            status = "error"
            stacktrace = error.text

        tests.append(
            ParsedTest(
                id=f"{classname}::{name}",
                name=name,
                classname=classname,
                status=status,
                stacktrace=stacktrace
            )
        )

    return tests

def extract_file_name_from_stacktrace(stacktrace: str) -> str | None:
    match = re.search(r'File "(.+?)"', stacktrace)
    return match.group(1) if match else None