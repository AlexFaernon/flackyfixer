import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from code_retrieval import GitHubCodeRetriever
from test_result_parser import parse_xml, extract_file_name_from_stacktrace
from config import github_key, github_owner, github_repo
from db import Base, engine, get_db
from llm_factory import get_llm
from pydantic_models import AnalyzeRequest
import db_commands

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

github_code_retriever = GitHubCodeRetriever(
    owner=github_owner,
    repo=github_repo,
    token=github_key
)

llm_provider = get_llm()


@app.post("/reports")
async def upload_report(name: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    parsed_tests = parse_xml(file)
    report = db_commands.create_report(db, name)
    db_commands.save_tests(db, report.id, parsed_tests)

    return {
        "report_id": report.id,
        "message": "Report uploaded successfully"
    }


@app.delete("/reports/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    db_commands.delete_report(db, report_id)
    return {"status": "deleted"}


@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db_commands.get_reports(db)
    return [
        {
            "report_id": str(r.id),
            "name": r.name
        }
        for r in reports
    ]


@app.get("/reports/{report_id}/tests")
def get_tests(report_id: str, db: Session = Depends(get_db)):
    report_name = db_commands.get_report_name(report_id, db)
    tests = db_commands.get_tests_in_report(report_id, db)
    tests_json = {
        t.id: {
            "name": t.name,
            "classname": t.classname,
            "status": t.status,
            "stacktrace": t.stacktrace
        }
        for t in tests
    }

    return {
        "report_name": report_name,
        "tests": tests_json
    }


@app.get("/reports/{report_id}/tests/{test_id}")
def get_test(report_id: str, test_id: str, db: Session = Depends(get_db)):
    test = db_commands.get_test(report_id, test_id, db)

    return {
        "test_id": test_id,
        "name": test.name,
        "status": test.status,
        "stacktrace": test.stacktrace
    }


@app.get("/reports/{report_id}/tests/{test_id}/code")
def get_code(report_id: str, test_id: str, db: Session = Depends(get_db)):
    test = db_commands.get_test(report_id, test_id, db)
    return get_test_code(test)


@app.post("/reports/{report_id}/tests/{test_id}/analyze")
def analyze_test(report_id: str, test_id: str, request: AnalyzeRequest, db: Session = Depends(get_db)):
    test = db_commands.get_test(report_id, test_id, db)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    stacktrace = test.stacktrace
    code = get_test_code(test)
    response = llm_provider.generate(stacktrace, code, request.additional_context)
    db_commands.save_analysis(db, test_id, report_id, response)
    return {
        "analysis": {
            "root_cause": response["root_cause"],
            "failure_type": response["failure_type"],
            "suggested_fix": response["suggested_fix"],
            "example": response["example"],
        }
    }


@app.get("/reports/{report_id}/tests/{test_id}/analyses")
def get_analyses(report_id: str, test_id: str, db: Session = Depends(get_db)):
    analyses = db_commands.get_analysis_from_db(db, report_id, test_id)
    return [
        {
            "id": str(a.id),
            "created_at": a.created_at,
            "analysis": a.analysis_json
        }
        for a in analyses
    ]


def get_test_code(test):
    stacktrace = test.stacktrace
    if stacktrace is None:
        return None
    file_name = extract_file_name_from_stacktrace(stacktrace)
    if not file_name:
        raise HTTPException(status_code=404, detail="file name not found")
    return github_code_retriever.get_file(file_name)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )