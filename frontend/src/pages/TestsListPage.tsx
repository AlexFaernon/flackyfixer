import { useEffect, useState } from "react";

type Test = {
    id: string;
    name: string;
    status: string;
};

export default function TestsListPage({ reportId }: { reportId: string }) {
    const [tests, setTests] = useState<Test[]>([]);
    const [filter, setFilter] = useState("all");

    const fetchTests = async () => {
        const res = await fetch(
            `http://localhost:8000/reports/${reportId}/tests`
        );
        const data = await res.json();

        // превращаем объект в массив
        const testsArray = Object.entries(data).map(([id, value]: any) => ({
            id,
            ...value,
        }));

        setTests(testsArray);
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const filteredTests =
        filter === "all"
            ? tests
            : tests.filter((t) => t.status === filter);

    return (
        <div className="container">
            <div className="header">Tests</div>

            {/* Filters */}
            <div className="card">
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
            </div>

            {/* Table */}
            <table className="table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Status</th>
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