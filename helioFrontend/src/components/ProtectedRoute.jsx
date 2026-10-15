import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ token, requiredRole, children }) {
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole) {
    try {
      if (JSON.parse(atob(token.split(".")[1])).role !== requiredRole) return <Navigate to="/login" replace />;
    } catch { return <Navigate to="/login" replace />; }
  }
  return children;
}
