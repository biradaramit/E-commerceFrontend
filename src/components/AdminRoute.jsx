import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// UI guard only. Hides admin pages from non-admins.
// The backend must still reject non-admin writes.
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
