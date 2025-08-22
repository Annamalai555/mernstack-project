import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Product from "../models/Product.js";
import QRCode from "qrcode";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// CREATE product with QR Code
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const newProduct = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category, // ✅ Added
      image: req.file ? `/uploads/${req.file.filename}` : null,
      user: req.user._id
    });

    await newProduct.save();

    // Generate QR code (including category info)
    const qrPath = `uploads/qrcode_${newProduct._id}.png`;
    await QRCode.toFile(
      qrPath,
      `Product ID: ${newProduct._id}\nTitle: ${newProduct.title}\nCategory: ${newProduct.category}`,
      { width: 300 }
    );

    newProduct.qrCode = `/${qrPath}`;
    await newProduct.save();

    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ all products
router.get("/", protect, async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json(products);
});

// UPDATE product
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category // ✅ Added
    };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Regenerate QR code
    const qrPath = `uploads/qrcode_${product._id}.png`;
    await QRCode.toFile(
      qrPath,
      `Product ID: ${product._id}\nTitle: ${product.title}\nCategory: ${product.category}`,
      { width: 300 }
    );
    product.qrCode = `/${qrPath}`;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/products", async (req, res) => {
  const { search = "", sort = "title", page = 1, limit = 5 } = req.query;

  const query = {
    title: { $regex: search, $options: "i" }
  };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort.startsWith("-") ? { [sort.slice(1)]: -1 } : { [sort]: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    products,
    totalPages: Math.ceil(total / limit)
  });
});
// DELETE product
router.delete("/:id", protect, async (req, res) => {
  const deleted = await Product.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });
  if (!deleted) return res.status(404).json({ message: "Product not found" });

  if (deleted.image && fs.existsSync(`.${deleted.image}`)) fs.unlinkSync(`.${deleted.image}`);
  if (deleted.qrCode && fs.existsSync(`.${deleted.qrCode}`)) fs.unlinkSync(`.${deleted.qrCode}`);

  res.json({ message: "Product deleted" });
});

export default router;
