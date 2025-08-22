import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);

      localStorage.setItem("token", res.data.token);
      // Store role as number
      localStorage.setItem("role", res.data.user.role);

      toast.success("Login successful");

      // Debug: check what role is returned
      console.log("User role:", res.data.user.role);

      // If admin (role === 1), go to /products; if user (role === 0), go to /user-products
      if (res.data.user.role === 1) {
        navigate("/products");
      } else {
        navigate("/user-products");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "auto", marginTop: 100 }}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
        required
      />
      <button type="submit" style={{ width: "100%", padding: 10 }}>
        Login
      </button>
    </form>
  );
}

export default Login;