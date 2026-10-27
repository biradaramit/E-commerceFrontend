import { useAuth } from "../context/AuthContext";
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

