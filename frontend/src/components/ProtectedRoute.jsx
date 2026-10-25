
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user || !localStorage.getItem("stockflow_token")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
