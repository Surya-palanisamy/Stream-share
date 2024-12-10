import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import GitHubCorner from "./components/GitHubCorner";
import Toast from "./components/toast/Toast";
import EditorPage from "./pages/EditorPage";
import HomePage from "./pages/HomePage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor/:roomId" element={<EditorPage />} />
            </Routes>
            {/* Components outside of Routes are rendered globally */}
            <Toast /> {/* Toast component from react-hot-toast */}
            <GitHubCorner />
        </Router>
    );
};

export default App;
