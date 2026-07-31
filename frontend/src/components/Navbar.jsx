import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">RankPilot</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/keywords">Keywords</Link>
            <button
              className="link-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="cta">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
