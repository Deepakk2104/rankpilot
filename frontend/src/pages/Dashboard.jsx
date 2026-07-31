import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const { data } = await api.get("/analyze/reports");
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/analyze", { url });
      navigate(`/reports/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze that URL");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <div className="analyze-card">
        <h2>Analyze a website</h2>
        <form onSubmit={handleAnalyze} className="analyze-form">
          <input
            type="text"
            placeholder="example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Scanning..." : "Run SEO Scan"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="reports-list">
        <h2>Past reports</h2>
        {reports.length === 0 ? (
          <p className="empty-state">No reports yet — run your first scan above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} onClick={() => navigate(`/reports/${r.id}`)}>
                  <td>{r.url}</td>
                  <td>
                    <span className={`score-pill score-${scoreTier(r.score)}`}>{r.score}</span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function scoreTier(score) {
  if (score >= 80) return "good";
  if (score >= 50) return "ok";
  return "bad";
}
