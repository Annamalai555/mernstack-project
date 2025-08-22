import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:5000");

export default function UserProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");

  // SOCKET: Receive Notifications
  useEffect(() => {
    socket.on("receive_notification", (data) => {
      // Show a custom styled toast for push notification in UserProducts.jsx
      toast(
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 22, marginRight: 10 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 700, color: "#1976d2" }}>{data.title}</div>
            <div style={{ color: "#333" }}>{data.message}</div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#e3f0ff",
            borderLeft: "6px solid #1976d2",
            borderRadius: "10px",
            fontSize: "1rem",
            minWidth: "260px",
            boxShadow: "0 4px 16px rgba(25,118,210,0.10)",
          },
          icon: false,
        }
      );
    });
    return () => {
      socket.off("receive_notification");
    };
  }, []);

  // Fetch Products & Currency
  useEffect(() => {
    fetchProducts();
    if (currency !== "INR") {
      fetchExchangeRate(currency);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (currency === "INR") {
      setExchangeRate(1);
    } else {
      fetchExchangeRate(currency);
    }
    // eslint-disable-next-line
  }, [currency]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch products");
      setLoading(false);
    }
  };

  const fetchExchangeRate = async (toCurrency) => {
    try {
      const res = await axios.get(
        `https://api.frankfurter.app/latest?from=INR&to=${toCurrency}`
      );
      if (res.data?.rates?.[toCurrency]) {
        setExchangeRate(res.data.rates[toCurrency]);
      }
    } catch (error) {
      toast.error("Failed to get exchange rate");
    }
  };

  const handleBuyNow = (product) => {
    toast.success(`${product.title} added to cart!`);
    setCartCount((prevCount) => prevCount + 1);
  };

  // Search + Sort + Pagination
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
  };

  if (loading)
    return (
      <div style={{ marginTop: 100, textAlign: "center", color: "#1976d2" }}>
        <div className="loader" />
        <p>Loading products...</p>
      </div>
    );

  // Colorful card backgrounds
  const cardColors = [
    "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    "linear-gradient(135deg, #21d4fd 0%, #b721ff 100%)",
    "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
    "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
    "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
    "linear-gradient(135deg, #7f53ac 0%, #647dee 100%)",
    "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    "linear-gradient(135deg, #21d4fd 0%, #b721ff 100%)",
    "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
    "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
    "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
    "linear-gradient(135deg, #7f53ac 0%, #647dee 100%)",
  ];

  return (
    <>
      <Navbar />
      <div
        style={{
          marginTop: 70,
          minHeight: "100vh",
          background: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
          padding: "0",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "32px 16px 0 16px",
          }}
        >
          {/* Currency, Search, Sort */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              marginBottom: 24,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(60,60,120,0.04)",
              padding: "18px 24px",
            }}
          >
            <div>
              <label htmlFor="currency-select" style={{ marginRight: "10px" }}>
                Convert prices to:
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  background: "#f8fafc",
                }}
              >
                {Object.keys(currencySymbols).map((code) => (
                  <option key={code} value={code}>
                    {code} ({currencySymbols[code]})
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #bdbdbd",
                flex: 1,
                minWidth: 180,
                background: "#f8fafc",
                fontSize: 16,
              }}
            />
            <select
              onChange={(e) => setSortField(e.target.value)}
              value={sortField}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #bdbdbd",
                background: "#f8fafc",
                fontSize: 16,
              }}
            >
              <option value="">Sort by</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
            </select>
            <select
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #bdbdbd",
                background: "#f8fafc",
                fontSize: 16,
              }}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          {/* Products Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "32px",
              marginBottom: 40,
            }}
          >
            {paginatedProducts.map((p, idx) => (
              <div
                key={p._id}
                style={{
                  background: cardColors[idx % cardColors.length],
                  borderRadius: "22px",
                  boxShadow: "0 4px 24px rgba(60,60,120,0.13)",
                  padding: "28px 22px 22px 22px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minHeight: 420,
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                className="product-list-card"
              >
                {p.image && (
                  <img
                    src={`http://localhost:5000${p.image}`}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "14px",
                      marginBottom: "18px",
                      background: "#fff",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                    }}
                  />
                )}
                <h3 style={{
                  color: "#fff",
                  marginBottom: 8,
                  fontWeight: 700,
                  fontSize: 22,
                  textShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}>{p.title}</h3>
                <p style={{
                  color: "#fff",
                  marginBottom: 8,
                  minHeight: 40,
                  fontWeight: 500,
                  textShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}>
                  {p.description}
                </p>
                <div style={{
                  fontWeight: 800,
                  fontSize: 24,
                  marginBottom: 16,
                  color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.10)"
                }}>
                  {currencySymbols[currency]}
                  {currency === "INR"
                    ? p.price
                    : (p.price * exchangeRate).toFixed(2)}
                </div>
                <button
                  onClick={() => handleBuyNow(p)}
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    color: "#1976d2",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 32px",
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: "pointer",
                    marginTop: "auto",
                    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
                    letterSpacing: 1,
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseOver={e => {
                    e.target.style.background = "#1976d2";
                    e.target.style.color = "#fff";
                  }}
                  onMouseOut={e => {
                    e.target.style.background = "rgba(255,255,255,0.92)";
                    e.target.style.color = "#1976d2";
                  }}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: "#fff",
                color: "#1976d2",
                fontWeight: 700,
                fontSize: 16,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(60,60,120,0.06)",
              }}
            >
              Prev
            </button>
            <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: "#fff",
                color: "#1976d2",
                fontWeight: 700,
                fontSize: 16,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(60,60,120,0.06)",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Loader CSS */}
      <style>
        {`
          .loader {
            border: 6px solid #e3e3e3;
            border-top: 6px solid #1976d2;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .product-list-card:hover {
            box-shadow: 0 12px 32px rgba(25, 118, 210, 0.18);
            transform: translateY(-4px) scale(1.03);
          }
        `}
      </style>
    </>
  );
}
