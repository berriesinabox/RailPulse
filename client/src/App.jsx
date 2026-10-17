
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
  const { token, user, logout } = useAuth();

  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch faults only after login
  useEffect(() => {
    let cancelled = false;

    async function fetchFaults() {
      if (!token) {
        setFaults([]);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/faults",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch faults.");
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
          setError(err.message || "Failed to fetch faults.");
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
  }, [token]);

  // Report a fault
  async function addFault(faultData) {
    const response = await fetch(
      "http://localhost:5000/api/faults",
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
      throw new Error(data.message || "Failed to report the fault.");
    }

    const savedFault = {
      ...data.fault,
      id: data.fault._id,
    };

    setFaults((previous) => [savedFault, ...previous]);
  }

  // Delete a fault
  async function deleteFault(id) {
    const response = await fetch(
      `http://localhost:5000/api/faults/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete the fault.");
    }

    setFaults((previous) =>
      previous.filter((fault) => fault.id !== id)
    );
  }

  // Update a fault's status
  async function updateStatus(id, status) {
    const response = await fetch(
      `http://localhost:5000/api/faults/${id}/status`,
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
      throw new Error(data.message || "Failed to update status.");
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

  // Protect pages that require login
  function requireLogin(element) {
    return token && user ? element : <Navigate to="/login" replace />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={requireLogin(
            <>
              {loading && (
                <p className="api-message">Loading faults...</p>
              )}

              {error && (
                <p className="api-error" role="alert">
                  {error}
                </p>
              )}

              <Dashboard
                faults={faults}
                onDelete={deleteFault}
                onUpdateStatus={updateStatus}
              />
            </>
          )}
        />

        <Route
          path="/report-fault"
          element={requireLogin(
            <ReportFault onAddFault={addFault} />
          )}
        />

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

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
