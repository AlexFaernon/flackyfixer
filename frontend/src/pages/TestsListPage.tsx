import { useEffect, useState } from "react";

type Test = {
    id: string;
    name: string;
    status: string;
};

export default function TestsListPage({ reportId }: { reportId: string }) {
    const API_URL = import.meta.env.VITE_API_URL;

    const [tests, setTests] = useState<Test[]>([]);
    const [reportName, setReportName] = useState("");
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchTests = async () => {
        const res = await fetch(
            `${API_URL}/reports/${reportId}/tests`
        );
        const data = await res.json();

        setReportName(data.report_name);

        const testsArray = Object.entries(data.tests).map(
            ([id, value]: any) => ({
                id,
                ...value,
            })
        );

        setTests(testsArray);
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const filteredTests = tests.filter((t) => {
        const statusMatch =
            filter === "all" || t.status === filter;

        const nameMatch =
            t.name
                .toLowerCase()
                .includes(search.toLowerCase());

        return statusMatch && nameMatch;
    });

    return (
        <div className="container">
            <div className="header">
                {reportName
                    ? `Отчет ${reportName}`
                    : "Тесты"}
            </div>

            <div className="test-toolbar">
                <button className="button" onClick={() => setFilter("all")}>
                    All
                </button>
                <button
                    className="button"
                    onClick={() => setFilter("failed")}
                >
                    Failed
                </button>
                <button
                    className="button"
                    onClick={() => setFilter("passed")}
                >
                    Passed
                </button>
                <button
                    className="button"
                    onClick={() => setFilter("error")}
                >
                    Error
                </button>
                <input
                    className="input"
                    type="text"
                    placeholder="Поиск по названию теста"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <table className="table">
                <thead>
                <tr>
                    <th>Имя</th>
                    <th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {filteredTests.map((test) => (
                    <tr
                        key={test.id}
                        onClick={() =>
                            (window.location.href = `/reports/${reportId}/tests/${test.id}`)
                        }
                    >
                        <td>{test.name}</td>
                        <td>
                <span className={`status ${test.status}`}>
                  {test.status}
                </span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}