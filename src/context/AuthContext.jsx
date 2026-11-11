import { useState } from "react";
import { AuthContext } from "./authContextObject";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
  
    if (!savedUser) {
      return null;
    }
    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Saved user data is invalid.", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      return null;
    }
  });

  function login(authResponse) {
    const userData = {
      userId: authResponse.userId,
      email: authResponse.email,
      firstName: authResponse.firstName,
      roles: authResponse.roles
    };

    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  }

  // UI-only check. The backend must enforce Admin on every write.
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("Admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated : Boolean(user),
        isAdmin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
