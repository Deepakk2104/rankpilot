import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [term, setTerm] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [checkingId, setCheckingId] = useState(null);

  useEffect(() => {
    loadKeywords();
  }, []);

  async function loadKeywords() {
    try {
      const { data } = await api.get("/keywords");
      setKeywords(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/keywords", { term, domain });
      setTerm("");
      setDomain("");
      loadKeywords();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add keyword");
    }
  }

  async function handleCheck(id) {
    setCheckingId(id);
    try {
      await api.post(`/keywords/${id}/check`);
      loadKeywords();
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingId(null);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/keywords/${id}`);
    loadKeywords();
  }

  return (
    <div className="keywords-page">
      <div className="analyze-card">
        <h2>Track a keyword</h2>
        <form onSubmit={handleAdd} className="keyword-form">
          <input placeholder="keyword, e.g. best crm software" value={term} onChange={(e) => setTerm(e.target.value)} required />
          <input placeholder="your domain, e.g. example.com" value={domain} onChange={(e) => setDomain(e.target.value)} required />
          <button type="submit">Track</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="reports-list">
        <h2>Tracked keywords</h2>
        {keywords.length === 0 ? (
          <p className="empty-state">No keywords tracked yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Domain</th>
                <th>Latest position</th>
                <th>History</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((k) => (
                <tr key={k.id}>
                  <td>{k.term}</td>
                  <td>{k.domain}</td>
                  <td>{k.checks[0]?.position ?? "—"}</td>
                  <td>
                    {k.checks
                      .slice()
                      .reverse()
                      .map((c) => c.position ?? "—")
                      .join(" → ") || "No checks yet"}
                  </td>
                  <td>
                    <button onClick={() => handleCheck(k.id)} disabled={checkingId === k.id}>
                      {checkingId === k.id ? "Checking..." : "Check now"}
                    </button>
                    <button className="link-button danger" onClick={() => handleDelete(k.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
