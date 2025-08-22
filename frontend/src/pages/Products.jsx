import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { QrReader } from "react-qr-reader";
import QrCodeDecoder from "qrcode-decoder";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [decodedQrText, setDecodedQrText] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const sendNotification = () => {
    if (!title || !message) {
      alert("Please enter title and message");
      return;
    }
    socket.emit("send_notification", { title, message });
    alert("Notification sent!");
    setTitle("");
    setMessage("");
  };
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    if (currency !== "INR") {
      fetchExchangeRate(currency);
    }
  }, []);

  useEffect(() => {
    if (currency === "INR") {
      setExchangeRate(1);
    } else {
      fetchExchangeRate(currency);
    }
  }, [currency]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch {
      toast.error("Failed to fetch products");
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
    } catch {
      toast.error("Failed to fetch exchange rate");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    if (image) formData.append("image", image);

    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/products/${editId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Product updated");
      } else {
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product created");
      }

      setForm({ title: "", description: "", price: "", category: "" });
      setImage(null);
      setEditId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleEdit = (p) => {
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
    });
    setImage(null);
    setEditId(p._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`http://localhost:5000/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Product deleted");
    fetchProducts();
  };

  const handleScanResult = (result) => {
    if (result?.text) {
      setDecodedQrText(result.text);
      setForm((prev) => ({ ...prev, title: result.text }));
      setShowScanner(false);
      toast.success("QR Code scanned and title updated");
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const qrDecoder = new QrCodeDecoder();
      const dataUrl = await toDataURL(file);
      const result = await qrDecoder.decodeFromImage(dataUrl);
      if (result?.data) {
        setDecodedQrText(result.data);
        setForm((prev) => ({ ...prev, title: result.data }));
        toast.success("QR Code image decoded and title updated");
      }
    } catch {
      toast.error("Error decoding QR Code image");
    }
    e.target.value = null;
  };

  const toDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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

  return (
    <>
      <Navbar />
      <div
        style={{
          marginTop: "60px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          minHeight: "calc(100vh - 60px)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ padding: "20px" }}>
          <h2>Admin — Send Notification</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <br />
          <button onClick={sendNotification}>Send</button>
        </div>
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          {/* QR Scanner Section */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowScanner(!showScanner)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {showScanner ? "Close QR Scanner" : "Open QR Scanner"}
            </button>
            <label
              htmlFor="qr-upload"
              style={{
                padding: "8px 15px",
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Upload QR Code Image
            </label>
            <input
              type="file"
              id="qr-upload"
              accept="image/*"
              onChange={handleQrUpload}
              style={{ display: "none" }}
            />
          </div>

          {showScanner && (
            <div style={{ marginBottom: "20px", maxWidth: "400px" }}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={handleScanResult}
                containerStyle={{ width: "100%" }}
                videoStyle={{ width: "100%" }}
              />
            </div>
          )}

          {decodedQrText && (
            <div style={{ marginBottom: "15px", color: "green" }}>
              <strong>Decoded QR Code:</strong> {decodedQrText}
            </div>
          )}

          {/* Currency Select */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="currency-select" style={{ marginRight: "10px" }}>
              Convert prices to:
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ padding: "6px" }}
            >
              {Object.entries({
                INR: "INR (₹)",
                USD: "USD ($)",
                EUR: "EUR (€)",
                GBP: "GBP (£)",
                JPY: "JPY (¥)",
                AUD: "AUD (A$)",
                CAD: "CAD (C$)",
              }).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Search + Sort */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px", flex: 1 }}
            />
            <select
              onChange={(e) => setSortField(e.target.value)}
              value={sortField}
              style={{ padding: "8px" }}
            >
              <option value="">Sort by</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
            </select>
            <select
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
              style={{ padding: "8px" }}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: "8px", flex: "1" }}
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ padding: "8px", flex: "1" }}
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={{ padding: "8px", width: "150px" }}
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ padding: "8px", width: "200px" }}
            />
            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            <button
              type="submit"
              style={{
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                padding: "8px 15px",
                cursor: "pointer",
              }}
            >
              {editId ? "Update" : "Add"}
            </button>
          </form>

          {/* Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>QR Code</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p, index) => (
                <tr
                  key={p._id}
                  style={{
                    background: index % 2 === 0 ? "#fafafa" : "#fff",
                    textAlign: "center",
                  }}
                >
                  <td style={tdStyle}>
                    {p.image && (
                      <img
                        src={`http://localhost:5000${p.image}`}
                        alt={p.title}
                        style={{ width: "60px", borderRadius: "5px" }}
                      />
                    )}
                  </td>
                  <td style={tdStyle}>{p.title}</td>
                  <td style={tdStyle}>{p.description}</td>
                  <td style={tdStyle}>
                    ₹{p.price}
                    {currency !== "INR" && (
                      <div style={{ fontSize: "0.85em", color: "#555" }}>
                        {currencySymbols[currency]}
                        {(p.price * exchangeRate).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>{p.category}</td>
                  <td style={tdStyle}>
                    {p.qrCode && (
                      <img
                        src={`http://localhost:5000${p.qrCode}`}
                        alt="QR Code"
                        style={{ width: "60px" }}
                      />
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{
                        background: "#2196F3",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        marginRight: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{
                        background: "#f44336",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: "5px 10px" }}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ padding: "5px 10px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};
