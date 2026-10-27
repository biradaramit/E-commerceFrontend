import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          E-Shop
        </Link>

        <nav className="nav-links">
          <Link to="/">Products</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">My Orders</Link>

              <span className="welcome-text">
                Hi, {user.firstName || user.email}
              </span>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;