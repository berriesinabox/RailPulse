
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("railpulse_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("railpulse_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  function login(token, user) {
    localStorage.setItem("railpulse_token", token);
    localStorage.setItem("railpulse_user", JSON.stringify(user));

    setToken(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("railpulse_token");
    localStorage.removeItem("railpulse_user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
