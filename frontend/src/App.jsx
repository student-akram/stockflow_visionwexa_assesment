
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
function HomeRedirect() {
  const { user } = useAuth();

  return (
    <Navigate to={user ? "/dashboard" : "/login"} replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

       <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
