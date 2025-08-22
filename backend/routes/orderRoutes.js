import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Place order
router.post("/", async (req, res) => {
  const { userId, items, address, paymentType, total } = req.body;
  try {
    const order = await Order.create({
      userId,
      items,
      address,
      paymentType,
      total
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Get orders for user
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to get orders" });
  }
});

export default router;