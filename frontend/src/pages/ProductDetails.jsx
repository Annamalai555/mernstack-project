import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import UserSidebar from "../components/UserSidebar"; // <-- use sidebar
import { toast } from "react-toastify";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  // Add to Cart with quantity update
  const addToCart = () => {
    // Get existing cart or empty array
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    // Add current product
    cart.push({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Product added to cart!");
  };

  // Buy Now: Add to cart and redirect to cart page
  const handleBuyNow = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(item => item.id === product._id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ marginTop: 60, padding: 20, textAlign: "center" }}>
          <h2>Loading...</h2>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div style={{ marginTop: 60, padding: 20, textAlign: "center" }}>
          <h2>Product not found</h2>
          <button
            style={{
              padding: "10px 28px",
              background: "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "not-allowed",
              marginTop: "20px"
            }}
            disabled
          >
            Buy Now
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <UserSidebar />
      <div style={{
        marginTop: 60,
        marginLeft: 200, // add left margin for sidebar
        padding: 20,
        maxWidth: 600,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(60,60,120,0.08)"
      }}>
        <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 20 }}>{product.title}</h2>
        {product.image && (
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.title}
            style={{
              width: "100%",
              maxWidth: 300,
              borderRadius: 10,
              marginBottom: 20,
              display: "block",
              marginLeft: "auto",
              marginRight: "auto"
            }}
          />
        )}
        <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: 12 }}>{product.description}</p>
        <p style={{ fontSize: "1rem", color: "#888", marginBottom: 8 }}>Category: {product.category}</p>
        <p style={{ fontWeight: 700, color: "#1976d2", fontSize: "1.2rem", marginBottom: 16 }}>
          Price: ₹{product.price}
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            style={{
              padding: "10px 28px",
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer"
            }}
            onClick={addToCart}
          >
            Add to Cart
          </button>
          <button
            style={{
              padding: "10px 28px",
              background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer"
            }}
            onClick={addToCart}
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}