import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";
import UserProducts from "./pages/UserProducts";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




function App() {
  return (
    <>
    <Routes>
      
        <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/user-products" element={<UserProducts />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/" element={<Products />} />
        
    </Routes>
    <ToastContainer />
    </>
  );
}

export default App;
