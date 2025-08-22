import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header style={headerStyle}>
      <h1 style={{ margin: 0 }}>My App</h1>
      <button
        onClick={handleLogout}
        style={logoutBtnStyle}
        aria-label="Logout"
      >
        Logout
      </button>
    </header>
  );
}

const headerStyle = {
  height: "60px",
  width: "100vw", // Full viewport width
  backgroundColor: "#00adb5",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  color: "#eeeeee",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  margin: 0, // Remove default margin
};

const logoutBtnStyle = {
  backgroundColor: "transparent",
  border: "1px solid #eeeeee",
  color: "#eeeeee",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  userSelect: "none",
};
