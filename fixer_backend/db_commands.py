from sqlalchemy.orm import Session
from models import Report, Test, Analysis
from test_result_parser import ParsedTest

def create_report(db: Session, name: str) -> Report:
    report = Report(name=name)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def save_tests(db: Session, report_id: str, parsed_tests: list[ParsedTest]):
    tests = [
        Test(
            external_id=t.id,
            report_id=report_id,
            name=t.name,
            classname=t.classname,
            status=t.status,
            stacktrace=t.stacktrace
        )
        for t in parsed_tests
    ]

    db.add_all(tests)
    db.commit()


def save_analysis(db: Session, test_id: str, report_id: str, result: dict):
    analysis = Analysis(
        test_id=test_id,
        report_id=report_id,
        analysis_json=result
    )

    db.add(analysis)
    db.commit()


def get_reports(db: Session) -> list[Report]:
    return db.query(Report).all()

def get_tests_in_report(report_id: str, db: Session) -> list[Test]:
    return db.query(Test).filter_by(report_id=report_id).all()

def get_test(report_id: str, test_id: str, db: Session) -> Test:
    return db.query(Test).filter_by(report_id=report_id, external_id=test_id).first()


def get_analysis_from_db(db: Session, report_id: str, test_id: str):
    return (db.query(Analysis)
        .filter_by(report_id=report_id, test_id=test_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

def delete_report(db: Session, report_id: str):
    report = db.query(Report).filter_by(id=report_id).first()

    db.delete(report)
    db.commit()