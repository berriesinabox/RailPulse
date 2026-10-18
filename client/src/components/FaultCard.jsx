
import { useState } from "react";

function FaultCard({
  id,
  title,
  severity,
  status,
  role,
  assignedEngineer,
  engineers = [],
  onAssignEngineer,
  onDelete,
  onUpdateStatus,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canUpdateStatus =
    role === "Engineer" || role === "Admin";

  const canDelete = role === "Admin";
  const canAssign = role === "Admin";

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

  async function handleAssignEngineer(e) {
    const engineerId = e.target.value;

    if (!engineerId) return;

    setBusy(true);
    setError("");

    try {
      await onAssignEngineer(id, engineerId);
    } catch (err) {
      setError(err.message || "Could not assign Engineer.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${title}" permanently?`
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await onDelete(id);
    } catch (err) {
      setError(err.message || "Could not delete fault.");
    } finally {
      setBusy(false);
    }
  }

  const assignedEngineerId =
    assignedEngineer?._id || assignedEngineer || "";

  return (
    <article className="fault-card">
      <div className="fault-info">
        <h3>{title}</h3>

        <div className="fault-meta">
          <span
            className={`severity severity-${severity.toLowerCase()}`}
          >
            {severity} severity
          </span>

          <span
            className={`status status-${status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {status}
          </span>
        </div>

        <p className="assigned-engineer">
          <strong>Assigned Engineer:</strong>{" "}
          {assignedEngineer?.name || "Not assigned yet"}
        </p>

        {canAssign && (
          <div className="assign-engineer">
            <label htmlFor={`engineer-${id}`}>
              Assign Engineer
            </label>

            <select
              id={`engineer-${id}`}
              value={assignedEngineerId}
              onChange={handleAssignEngineer}
              disabled={busy || engineers.length === 0}
            >
              <option value="">
                {engineers.length === 0
                  ? "No Engineers available"
                  : "Select an Engineer"}
              </option>

              {engineers.map((engineer) => (
                <option
                  key={engineer._id}
                  value={engineer._id}
                >
                  {engineer.name} ({engineer.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="fault-actions">
        {canUpdateStatus && (
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
        )}

        {canDelete && (
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={busy}
          >
            {busy ? "Please wait..." : "Delete"}
          </button>
        )}
      </div>
    </article>
  );
}

export default FaultCard;
