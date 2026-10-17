
import { useState } from "react";

function FaultCard({
  id,
  title,
  severity,
  status,
  onDelete,
  onUpdateStatus,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setBusy(true);
    setError("");

    try {
      await onUpdateStatus(id, newStatus);
    } catch (err) {
      setError(err.message || "Could not update status.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}" permanently?`)) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await onDelete(id);
    } catch (err) {
      setError(err.message || "Could not delete fault.");
      setBusy(false);
    }
  }

  return (
    <article className="fault-card">
      <div className="fault-info">
        <h3>{title}</h3>

        <div className="fault-meta">
          <span className={`severity severity-${severity.toLowerCase()}`}>
            {severity} severity
          </span>

          <span
            className={`status status-${status.toLowerCase().replace(" ", "-")}`}
          >
            {status}
          </span>
        </div>

        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="fault-actions">
        <select
          aria-label={`Update status for ${title}`}
          value={status}
          onChange={handleStatusChange}
          disabled={busy}
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={busy}
        >
          {busy ? "Please wait..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default FaultCard;
