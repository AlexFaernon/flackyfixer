import ReportsPage from "./pages/ReportsPage";
import TestsListPage from "./pages/TestsListPage";
import TestPage from "./pages/TestPage";

function App() {
    const path = window.location.pathname;
    const parts = path.split("/");

    if (parts.length === 5) {
        return (
            <TestPage
                reportId={parts[2]}
                testId={parts[4]}
            />
        );
    }

    if (path.startsWith("/reports/")) {
        return <TestsListPage reportId={parts[2]} />;
    }

    return <ReportsPage />;
}

export default App;