import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <div className="hero">
        <h1>Know exactly why your site isn't ranking.</h1>
        <p>
          RankPilot scans any URL for on-page SEO issues — titles, meta tags,
          headings, image alt text, mobile-friendliness and more — then
          generates a plain-English report and tracks your keyword rankings
          over time.
        </p>
        <Link to={user ? "/dashboard" : "/register"} className="cta-large">
          {user ? "Go to dashboard" : "Get started free"}
        </Link>
      </div>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Instant SEO Audit</h3>
          <p>Paste a URL and get a scored breakdown across 11 on-page factors in seconds.</p>
        </div>
        <div className="feature-card">
          <h3>AI Report Summaries</h3>
          <p>Get a plain-English verdict and prioritized fix list, not just a wall of data.</p>
        </div>
        <div className="feature-card">
          <h3>Keyword Rank Tracking</h3>
          <p>Track how your domain ranks for the keywords that matter, and watch it change over time.</p>
        </div>
      </div>
    </div>
  );
}
