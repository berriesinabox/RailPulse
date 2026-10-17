
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ReportFault({ onAddFault }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !location.trim() || !description.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onAddFault({
        title: title.trim(),
        location: location.trim(),
        severity,
        description: description.trim(),
      });

      alert("Fault reported successfully!");

      setTitle("");
      setLocation("");
      setSeverity("Medium");
      setDescription("");
    } catch (err) {
      setError(err.message || "Failed to report the fault. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard report-page">
        <p className="eyebrow">RAILWAY MAINTENANCE SYSTEM</p>
        <h1>Report a Fault</h1>
        <p className="subtitle">
          Help keep railway operations safe by reporting an issue.
        </p>

        <section className="report-section">
          <form onSubmit={handleSubmit} className="report-page-form">
            <label htmlFor="fault-title">Fault title</label>
            <input
              id="fault-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Signal failure near platform 2"
              required
            />

            <label htmlFor="fault-location">Location</label>
            <input
              id="fault-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Silchar station, Platform 2"
              required
            />

            <label htmlFor="fault-severity">Severity</label>
            <select
              id="fault-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <label htmlFor="fault-description">Description</label>
            <textarea
              id="fault-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the fault and its impact..."
              rows={5}
              required
            />

            {error && (
              <p className="api-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Fault Report"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ReportFault;
