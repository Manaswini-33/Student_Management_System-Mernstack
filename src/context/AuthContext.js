import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // ✅ NEW: Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // ✅ NEW: Toggle Function
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setToken(token);
    setRole(role);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        login,
        logout,
        darkMode,      // ✅ added
        toggleTheme    // ✅ added
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;