
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function Login() {
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.registered ? location.state.email : ""
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      login(data.token, data.user);
      const roleRoutes = {
        Passenger: "/passenger",
        Engineer: "/engineer",
        Admin: "/admin",
      };

      navigate(roleRoutes[data.user.role] || "/");
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard report-page">
        <p className="eyebrow">RAILWAY MAINTENANCE SYSTEM</p>
        <h1>Welcome back</h1>
        <p className="subtitle">
          Log in to continue to RailPulse.
        </p>

        <section className="report-section">
          <form
            onSubmit={handleSubmit}
            className="report-page-form"
          >
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">Password</label>

            
            <div className="password-wrapper">
            <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
            />

            <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                    stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A11 11 0 0121 12a11.8 11.8 0 01-3.1 4.2" />
                    <path d="M6.2 6.2A12 12 0 003 12s3.3 7 9 7a9.5 9.5 0 004-.9" />
                </svg>
                ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                    stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                )}
            </button>
            </div>




            
            {location.state?.registered && (
            <p className="success-message" role="status">
                Account created successfully! Please log in.
            </p>
            )}

            {error && (
            <p className="api-error" role="alert">
                {error}
            </p>
            )}


            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p>
              Don't have an account?{" "}
              <Link to="/register">Register here</Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
