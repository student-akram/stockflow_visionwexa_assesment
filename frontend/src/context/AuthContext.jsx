
import {
  createContext,
  useContext,
  useState,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("stockflow_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("stockflow_user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  async function login(credentials) {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user: loggedInUser } = response.data;

      localStorage.setItem("stockflow_token", token);
      localStorage.setItem(
        "stockflow_user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }

  async function signup(details) {
    setLoading(true);

    try {
      const response = await api.post("/auth/signup", details);
      const { token, user: registeredUser } = response.data;

      localStorage.setItem("stockflow_token", token);
      localStorage.setItem(
        "stockflow_user",
        JSON.stringify(registeredUser)
      );

      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("stockflow_token");
    localStorage.removeItem("stockflow_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
