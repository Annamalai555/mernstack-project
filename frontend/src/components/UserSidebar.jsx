import React from "react";
import { Link, useLocation } from "react-router-dom";

const sidebarStyle = {
  position: "fixed",
  top: 60,
  left: 0,
  width: "180px",
  height: "calc(100vh - 60px)",
  background: "#1976d2",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  paddingTop: "30px",
  gap: "18px",
  fontWeight: 600,
  fontSize: "1.1rem",
  zIndex: 100,
};

const linkStyle = (active) => ({
  color: "#fff",
  textDecoration: "none",
  padding: "12px 24px",
  background: active ? "#1565c0" : "none",
  borderRadius: "6px",
  margin: "0 12px",
  transition: "background 0.2s",
});

export default function UserSidebar() {
  const location = useLocation();
  return (
    <aside style={sidebarStyle}>
      <Link to="/user-products" style={linkStyle(location.pathname === "/user-products")}>Shop</Link>
      <Link to="/cart" style={linkStyle(location.pathname === "/cart")}>Cart</Link>
      <Link to="/orders" style={linkStyle(location.pathname === "/orders")}>My Orders</Link>
      <Link to="/profile" style={linkStyle(location.pathname === "/profile")}>Profile</Link>
      <Link to="/logout" style={linkStyle(location.pathname === "/logout")}>Logout</Link>
    </aside>
  );
}