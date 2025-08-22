import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate(); // For programmatic navigation
  
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, []);

  const addToCart = (product) => {
    // Check if product is already in cart
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already exists
      setCartItems(prev => prev.map(item => 
        item.id === product.id 
          ? {...item, quantity: (item.quantity || 1) + 1} 
          : item
      ));
    } else {
      // Add new item with quantity 1
      setCartItems([...cartItems, {...product, quantity: 1}]);
    }
    
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    // Navigate to cart page
    navigate("/cart");
  };

  const removeFromCart = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div>
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <h3>{item.title}</h3>
                  <p>₹{item.price} × {item.quantity || 1}</p>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button 
                      onClick={() => updateQuantity(idx, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button 
                      onClick={() => updateQuantity(idx, (item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                    <button onClick={() => removeFromCart(idx)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2>Total: ₹{getTotal()}</h2>
          <button 
            style={{ 
              padding: "10px 20px", 
              background: "#4CAF50", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              marginTop: "20px"
            }}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}