
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Registration creates a Passenger account.
      // Log in separately using the new account's credentials.
      navigate("/login", {
        state: { registered: true, email },
      });
    } catch (err) {
      setError(err.message || "Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard report-page">
        <p className="eyebrow">RAILWAY MAINTENANCE SYSTEM</p>
        <h1>Create your account</h1>
        <p className="subtitle">
          Join RailPulse to report and track railway faults.
        </p>

        <section className="report-section">
          <form
            onSubmit={handleSubmit}
            className="report-page-form"
          >
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              required
            />

            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            
            <label htmlFor="register-password">Password</label>

            <div className="password-wrapper">
            <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
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
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A11 11 0 0 1 21 12a11.8 11.8 0 0 1-3.1 4.2" />
                    <path d="M6.2 6.2A12 12 0 0 0 3 12s3.3 7 9 7a9.5 9.5 0 0 0 4-.9" />
                </svg>
                ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                )}
            </button>
            </div>


            {error && (
              <p className="api-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p>
              Already registered?{" "}
              <Link to="/login">Log in here</Link>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Register;
