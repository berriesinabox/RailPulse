
import { useState } from "react";
import Navbar from "../components/Navbar";
import FaultCard from "../components/FaultCard";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function Dashboard({
  faults,
  engineers = [],
  onAssignEngineer,
  onDelete,
  onUpdateStatus,
}) {
  const { user } = useAuth();

  const role = user?.role;
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");

  const filteredFaults = faults.filter((fault) => {
    const matchesSearch = fault.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSeverity =
      filterSeverity === "All" ||
      fault.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const openCount = faults.filter(
    (fault) => fault.status === "Open"
  ).length;

  const progressCount = faults.filter(
    (fault) => fault.status === "In Progress"
  ).length;

  const resolvedCount = faults.filter(
    (fault) => fault.status === "Resolved"
  ).length;

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">RAILWAY MAINTENANCE SYSTEM</p>

            <h1>
              {role === "Admin"
                ? "Admin Dashboard"
                : role === "Engineer"
                ? "Engineer Dashboard"
                : "Passenger Dashboard"}
            </h1>

            <p className="subtitle">
              {role === "Admin"
                ? "Monitor railway faults and assign maintenance tasks."
                : role === "Engineer"
                ? "Track assigned faults and update repair progress."
                : "Report railway faults and track their status."}
            </p>
          </div>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Faults</p>
            <h2>{faults.length}</h2>
          </div>

          <div className="stat-card">
            <p>Open</p>
            <h2>{openCount}</h2>
          </div>

          <div className="stat-card">
            <p>In Progress</p>
            <h2>{progressCount}</h2>
          </div>

          <div className="stat-card">
            <p>Resolved</p>
            <h2>{resolvedCount}</h2>
          </div>
        </section>

        <section className="faults-section">
          <div className="section-heading">
            <h2>Reported Faults</h2>
            <span>{filteredFaults.length} shown</span>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search faults..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="All">All severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="fault-list">
            {filteredFaults.length > 0 ? (
              filteredFaults.map((fault) => (
                <FaultCard
                  key={fault.id}
                  id={fault.id}
                  title={fault.title}
                  severity={fault.severity}
                  status={fault.status}
                  role={role}
                  assignedEngineer={fault.assignedEngineer}
                  engineers={engineers}
                  onAssignEngineer={onAssignEngineer}
                  onDelete={onDelete}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            ) : (
              <p className="empty-state">
                No matching faults found.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
