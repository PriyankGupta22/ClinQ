import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ token, requiredRole, children, loginPath = "/login" }) {
  if (!token) return <Navigate to={loginPath} replace />;
  if (requiredRole) {
    try {
      if (JSON.parse(atob(token.split(".")[1])).role !== requiredRole) return <Navigate to={loginPath} replace />;
    } catch { return <Navigate to={loginPath} replace />; }
  }
  return children;
}
