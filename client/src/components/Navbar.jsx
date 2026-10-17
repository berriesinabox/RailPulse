
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(token && user);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <Link
        to={isLoggedIn ? "/" : "/login"}
        className="navbar-brand"
      >
        <span className="brand-mark">R</span>
        <span>
          Rail<span className="brand-accent">Pulse</span>
        </span>
      </Link>

      {isLoggedIn ? (
        <>
          <div className="navbar-links">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/report-fault">Report Fault</NavLink>
            <NavLink to="/faults">Faults</NavLink>
          </div>

          <div className="navbar-user">
            <div className="navbar-user-info">
              <span className="navbar-user-name">
                {user.name}
              </span>
              <span className="navbar-user-role">
                {user.role}
              </span>
            </div>

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="navbar-links">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
