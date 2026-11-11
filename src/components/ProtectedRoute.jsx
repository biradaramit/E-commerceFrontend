import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  if (!isAuthenticated) {
    navigate("/login");
  }

  return children;
}

export default ProtectedRoute;

