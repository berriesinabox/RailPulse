
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ReportFault from "./pages/ReportFault";
import Faults from "./pages/Faults";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token, user } = useAuth();
  const [engineers, setEngineers] = useState([]);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch faults after login
  useEffect(() => {
    let cancelled = false;

    async function fetchFaults() {
      if (!token || !user) {
        setFaults([]);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://rail-pulse-ldu9.vercel.app/api/faults",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch faults."
          );
        }

        if (!cancelled) {
          setFaults(
            data.map((fault) => ({
              ...fault,
              id: fault._id,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to fetch faults."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFaults();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  
  // Fetch Engineers for the Admin dashboard
  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      setEngineers([]);
      return;
    }

    async function fetchEngineers() {
      try {
        const response = await fetch(
          "https://rail-pulse-ldu9.vercel.app/api/users/engineers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch Engineers."
          );
        }

        setEngineers(data.engineers || []);
      } catch (err) {
        console.error("Fetch Engineers error:", err.message);
      }
    }

    fetchEngineers();
  }, [token, user?.role]);

  // Assign a fault to an Engineer
  async function assignEngineer(faultId, engineerId) {
    const response = await fetch(
      `https://rail-pulse-ldu9.vercel.app/api/faults/${faultId}/assign`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ engineerId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to assign Engineer."
      );
    }

    const updatedFault = {
      ...data.fault,
      id: data.fault._id,
    };

    setFaults((previous) =>
      previous.map((fault) =>
        fault.id === faultId ? updatedFault : fault
      )
    );
  }

  // Report a fault
  async function addFault(faultData) {
    const response = await fetch(
      "https://rail-pulse-ldu9.vercel.app/api/faults",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(faultData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to report the fault."
      );
    }

    const savedFault = {
      ...data.fault,
      id: data.fault._id,
    };

    setFaults((previous) => [
      savedFault,
      ...previous,
    ]);
  }

  // Delete a fault
  async function deleteFault(id) {
    const response = await fetch(
      `https://rail-pulse-ldu9.vercel.app/api/faults/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete the fault."
      );
    }

    setFaults((previous) =>
      previous.filter((fault) => fault.id !== id)
    );
  }

  // Update a fault's status
  async function updateStatus(id, status) {
    const response = await fetch(
      `https://rail-pulse-ldu9.vercel.app/api/faults/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update status."
      );
    }

    const updatedFault = {
      ...data.fault,
      id: data.fault._id,
    };

    setFaults((previous) =>
      previous.map((fault) =>
        fault.id === id ? updatedFault : fault
      )
    );
  }

  // Require login
  function requireLogin(element) {
    return token && user
      ? element
      : <Navigate to="/login" replace />;
  }

  // Require a specific role
  function requireRole(role, element) {
    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role === role) {
      return element;
    }

    // Redirect logged-in users to their own dashboard
    const roleRoutes = {
      Passenger: "/passenger",
      Engineer: "/engineer",
      Admin: "/admin",
    };

    return (
      <Navigate
        to={roleRoutes[user.role] || "/login"}
        replace
      />
    );
  }

  // Shared dashboard content
  const dashboardContent = (
    <>
      {loading && (
        <p className="api-message">
          Loading faults...
        </p>
      )}

      {error && (
        <p className="api-error" role="alert">
          {error}
        </p>
      )}

      <Dashboard
        faults={faults}
        engineers={engineers}
        onAssignEngineer={assignEngineer}
        onDelete={deleteFault}
        onUpdateStatus={updateStatus}
      />
    </>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            token && user ? (
              <Navigate
                to={
                  {
                    Passenger: "/passenger",
                    Engineer: "/engineer",
                    Admin: "/admin",
                  }[user.role] || "/"
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Default route */}
        <Route
          path="/"
          element={
            token && user ? (
              <Navigate
                to={
                  {
                    Passenger: "/passenger",
                    Engineer: "/engineer",
                    Admin: "/admin",
                  }[user.role] || "/login"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Passenger dashboard */}
        <Route
          path="/passenger"
          element={requireRole(
            "Passenger",
            dashboardContent
          )}
        />

        {/* Engineer dashboard */}
        <Route
          path="/engineer"
          element={requireRole(
            "Engineer",
            dashboardContent
          )}
        />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={requireRole(
            "Admin",
            dashboardContent
          )}
        />

        {/* Report a fault: all logged-in roles */}
        <Route
          path="/report-fault"
          element={requireLogin(
            <ReportFault onAddFault={addFault} />
          )}
        />

        {/* Fault list: all logged-in roles */}
        <Route
          path="/faults"
          element={requireLogin(
            <Faults
              faults={faults}
              onDelete={deleteFault}
              onUpdateStatus={updateStatus}
            />
          )}
        />

        /* Unknown routes */
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
