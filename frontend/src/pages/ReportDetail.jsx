import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/analyze/reports/${id}`)
      .then(({ data }) => setReport(data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load report"));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!report) return <p>Loading...</p>;

  const analysis = report.data;

  return (
    <div className="report-detail">
      <Link to="/dashboard" className="back-link">&larr; Back to dashboard</Link>
      <div className="report-header">
        <div>
          <h2>{report.url}</h2>
          <p className="report-date">{new Date(report.createdAt).toLocaleString()}</p>
        </div>
        <div className={`score-circle score-${scoreTier(report.score)}`}>{report.score}</div>
      </div>

      {report.aiSummary && (
        <div className="ai-summary">
          <h3>AI Summary</h3>
          <p style={{ whiteSpace: "pre-line" }}>{report.aiSummary}</p>
        </div>
      )}

      <div className="checks-list">
        <h3>Checks</h3>
        {analysis.checks.map((c) => (
          <div key={c.id} className={`check-row ${c.pass ? "pass" : "fail"}`}>
            <span className="check-icon">{c.pass ? "✓" : "✗"}</span>
            <div>
              <strong>{c.label}</strong>
              <p>{c.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function scoreTier(score) {
  if (score >= 80) return "good";
  if (score >= 50) return "ok";
  return "bad";
}
