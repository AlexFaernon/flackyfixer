import { useEffect, useState } from "react";

type Test = {
    id: string;
    name: string;
    status: string;
    stacktrace: string | null;
};

export default function TestPage({
                                     reportId,
                                     testId,
                                 }: {
    reportId: string;
    testId: string;
}) {
    const [test, setTest] = useState<Test | null>(null);
    const [code, setCode] = useState<string>("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // загрузка теста
    const fetchTest = async () => {
        const res = await fetch(
            `http://localhost:8000/reports/${reportId}/tests/${testId}`
        );
        const data = await res.json();
        setTest({ id: testId, ...data });
    };

    // загрузка кода
    const fetchCode = async () => {
        const res = await fetch(
            `http://localhost:8000/reports/${reportId}/tests/${testId}/code`
        );
        const data = await res.json();
        setCode(data || "");
    };

    useEffect(() => {
        fetchTest();
        fetchCode();
        fetchAnalyses();
    }, []);

    // анализ
    const analyze = async () => {
        setLoading(true);

        const res = await fetch(
            `http://localhost:8000/reports/${reportId}/tests/${testId}/analyze`,
            {
                method: "POST",
            }
        );

        const data = await res.json();
        setAnalysis(data.analysis);
        fetchAnalyses();

        setLoading(false);
    };

    const fetchAnalyses = async () => {
        const res = await fetch(
            `http://localhost:8000/reports/${reportId}/tests/${testId}/analyses`
        );
        const data = await res.json();
        setAnalyses(data);

        // сразу показываем последний
        if (data.length > 0) {
            setAnalysis(data[0].analysis);
        }
    };

    if (!test) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div className="header">{test.name}</div>

            {/* статус */}
            <div className="block">
        <span className={`status ${test.status}`}>
          {test.status}
        </span>
            </div>

            {/* stacktrace */}
            {test.stacktrace && (
                <div className="block">
                    <h3>Error</h3>
                    <div className="stacktrace">{test.stacktrace}</div>
                </div>
            )}

            {/* код */}
            <div className="block">
                <h3>Test code</h3>
                <div className="code">{code}</div>
            </div>

            {/* кнопка */}
            <div className="block">
                <button className="button" onClick={analyze} disabled={loading}>
                    {loading ? "Анализирую..." : "Анализ"}
                </button>
            </div>

            {/* результат */}
            {analysis && (
                <div className="block analysis">
                    <h3>Analysis</h3>

                    <p><b>Root cause:</b> {analysis.root_cause}</p>
                    <p><b>Failure type:</b> {analysis.failure_type}</p>
                    <p><b>Suggested fix:</b> {analysis.suggested_fix}</p>

                    {analysis.example && (
                        <>
                            <h4>Example fix</h4>
                            <div className="code">{analysis.example}</div>
                        </>
                    )}
                </div>
            )}

            <div className="block">
                <button
                    className="button"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    {showHistory ? "Скрыть историю" : "Показать историю"}
                </button>

                {showHistory && (
                    <div style={{ marginTop: 10 }}>
                        {analyses.map((a) => (
                            <div
                                key={a.id}
                                className="card"
                                style={{ marginBottom: 10 }}
                                onClick={() => setAnalysis(a.analysis)}
                            >
                                <div style={{ fontSize: 12, color: "#666" }}>
                                    {new Date(a.created_at).toLocaleString()}
                                </div>
                                <div>{a.analysis.root_cause}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}