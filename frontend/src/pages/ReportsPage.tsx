import { useEffect, useState } from "react";

type Report = {
    report_id: string;
    name: string;
};

export default function ReportsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [name, setName] = useState("");

    const fetchReports = async () => {
        const res = await fetch("http://localhost:8000/reports");
        const data = await res.json();
        setReports(data);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleUpload = async () => {
        if (!file || !name) return;

        const formData = new FormData();
        formData.append("file", file);

        await fetch(`http://localhost:8000/reports?name=${name}`, {
            method: "POST",
            body: formData,
        });

        setFile(null);
        setName("");
        fetchReports();
    };

    const handleDelete = async (reportId: string) => {
        const confirmed = window.confirm(
            "Удалить отчёт? Это действие необратимо."
        );

        if (!confirmed) return;

        const res = await fetch(
            `http://localhost:8000/reports/${reportId}`,
            {
                method: "DELETE",
            }
        );

        if (res.ok) {
            fetchReports(); // обновляем список
        } else {
            alert("Ошибка при удалении");
        }
    };

    return (
        <div className="container">
            <div className="header">Flaky Fixer</div>

            {/* Upload */}
            <div className="card">
                <h3>Upload report</h3>

                <input
                    className="input"
                    placeholder="Report name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="file"
                    accept=".xml"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <button className="button" onClick={handleUpload}>
                    Upload
                </button>
            </div>

            {/* Reports */}
            <div className="grid">
                {reports.map((r) => (
                    <div
                        key={r.report_id}
                        className="report-card"
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <div
                            onClick={() =>
                                (window.location.href = `/reports/${r.report_id}`)
                            }
                            style={{ cursor: "pointer", flex: 1 }}
                        >
                            <div>{r.name || r.report_id || "Report"}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                                {r.report_id.slice(0, 8)}
                            </div>
                        </div>

                        {/* DELETE BUTTON */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // чтобы не срабатывал переход
                                handleDelete(r.report_id);
                            }}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 16
                            }}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}