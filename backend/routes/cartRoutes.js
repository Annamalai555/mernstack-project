import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// Add/update cart for user
router.post("/", async (req, res) => {
  const { userId, items } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = items;
      cart.updatedAt = Date.now();
      await cart.save();
    } else {
      cart = await Cart.create({ userId, items });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to save cart" });
  }
});

export default router;