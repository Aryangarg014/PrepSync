import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import "./Navbar.css";

const Navbar = ({ isAuthenticated }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" aria-label="PrepSync home">
        <img src="/prepsync_logo.svg" alt="PrepSync" className="nav-logo" />
      </Link>

      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <Link to="/my-goals" className="nav-item">Goals</Link>
            <Link to="/my-groups" className="nav-item">Groups</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
