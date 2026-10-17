
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FaultCard from "../components/FaultCard";

function Faults({ faults, onDelete, onUpdateStatus }) {
  return (
    <div className="app">
      <Navbar />

      <main className="dashboard">
        <p className="eyebrow">RAILWAY MAINTENANCE SYSTEM</p>
        <h1>All Faults</h1>
        <p className="subtitle">
          View and monitor reported railway faults.
        </p>

        <section className="faults-section">
          <div className="section-heading">
            <h2>Fault Register</h2>
            <span>{faults.length} total</span>
          </div>

          <div className="fault-list">
            {faults.length > 0 ? (
              faults.map((fault) => (
                <div key={fault.id}>
                  <FaultCard
                    id={fault.id}
                    title={fault.title}
                    severity={fault.severity}
                    status={fault.status}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                  />

                  <p className="fault-location">
                    Location: {fault.location || "Not specified"}
                  </p>
                  <p className="fault-location">
                    {fault.description || ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="empty-state">
                No faults have been reported yet.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Faults;
