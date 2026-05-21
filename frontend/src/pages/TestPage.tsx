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
    const API_URL = import.meta.env.VITE_API_URL;

    const [test, setTest] = useState<Test | null>(null);
    const [code, setCode] = useState<string>("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [additionalContext, setAdditionalContext] = useState("");

    // загрузка теста
    const fetchTest = async () => {
        const res = await fetch(
            `${API_URL}/reports/${reportId}/tests/${testId}`
        );
        const data = await res.json();
        setTest({ id: testId, ...data });
    };

    // загрузка кода
    const fetchCode = async () => {
        const res = await fetch(
            `${API_URL}/reports/${reportId}/tests/${testId}/code`
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
            `${API_URL}/reports/${reportId}/tests/${testId}/analyze`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    additional_context:
                    additionalContext,
                }),
            }
        );

        const data = await res.json();
        setAnalysis(data.analysis);
        fetchAnalyses();

        setLoading(false);
    };

    const fetchAnalyses = async () => {
        const res = await fetch(
            `${API_URL}/reports/${reportId}/tests/${testId}/analyses`
        );
        const data = await res.json();
        setAnalyses(data);

        // сразу показываем последний
        if (data.length > 0) {
            setAnalysis(data[0].analysis);
        }
    };

    if (!test) return <div className="container">Загрузка...</div>;

    return (
        <div className="container">
            <div className="header">{test.name}</div>

            <div className="test-toolbar">

                <span className={`status status-large ${test.status}`}>
                     {test.status}
                </span>

                <button
                    className="button"
                    onClick={analyze}
                    disabled={loading}
                >
                    {loading ? "Анализирую..." : "Запустить анализ"}
                </button>

            </div>

            <div className="block">
                <h3>Дополнительный контекст</h3>

                <textarea
                    className="textarea"
                    rows={5}
                    placeholder={
                        "Необязательно. Например:\nТест падает только в CI\nОшибка появилась после обновления"
                    }
                    value={additionalContext}
                    onChange={(e) =>
                        setAdditionalContext(e.target.value)
                    }
                />
            </div>

            {/* результат */}
            {analysis && (
                <div className="block analysis">
                    <h3>Результат анализа</h3>

                    <p><b>Причина ошибки:</b> {analysis.root_cause}</p>
                    <p><b>Тип ошибки:</b> {analysis.failure_type}</p>
                    <p><b>Предлагаемое решение:</b> {analysis.suggested_fix}</p>

                    {analysis.example && (
                        <>
                            <h4>Пример решения</h4>
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
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#666",
                                        marginBottom: 10,
                                    }}
                                >
                                    {new Date(a.created_at).toLocaleString()}
                                </div>

                                <p>
                                    <b>Причина ошибки:</b>{" "}
                                    {a.analysis.root_cause}
                                </p>

                                <p>
                                    <b>Тип ошибки:</b>{" "}
                                    {a.analysis.failure_type}
                                </p>

                                <p>
                                    <b>Предлагаемое решение:</b>{" "}
                                    {a.analysis.suggested_fix}
                                </p>

                                {a.analysis.example && (
                                    <>
                                        <h4>Пример решения</h4>
                                        <div className="code">
                                            {a.analysis.example}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* stacktrace */}
            {test.stacktrace && (
                <div className="block">
                    <h3>Stacktrace</h3>
                    <div className="stacktrace">{test.stacktrace}</div>
                </div>
            )}

            {/* код */}
            <div className="block">
                <h3>Код теста</h3>
                <div className="code">{code}</div>
            </div>
        </div>
    );
}