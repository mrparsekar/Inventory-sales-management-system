const express = require("express");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create sale (Staff/Admin)
router.post("/", protect, async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.quantity < quantity)
    return res.status(400).json({ message: "Insufficient stock" });

  product.quantity -= quantity;
  await product.save();

  const totalAmount = product.price * quantity;

  const sale = await Sale.create({
    product: productId,
    quantity,
    totalAmount,
    soldBy: req.user._id,
  });

  res.status(201).json(sale);
});

// Staff & Admin: view sales
router.get("/", protect, async (req, res) => {
  const sales = await Sale.find()
    .populate("product", "name price")
    .populate("soldBy", "name email");

  res.json(sales);
});

// Admin revenue
router.get("/stats", protect, adminOnly, async (req, res) => {
  const sales = await Sale.find();
  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  res.json({ revenue });
});

module.exports = router;
