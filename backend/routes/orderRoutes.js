const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Place order (Customer)
router.post("/", protect, async (req, res) => {
  const { items } = req.body;
  let total = 0;

  for (let i of items) {
    const product = await Product.findById(i.product);
    total += product.price * i.quantity;
  }

  const order = await Order.create({
    items,
    total,
    orderedBy: req.user.id
  });

  res.status(201).json(order);
});

// View orders (Staff/Admin)
router.get("/", protect, async (req, res) => {
  const orders = await Order.find()
    .populate("items.product", "name price")
    .populate("orderedBy", "name");

  res.json(orders);
});

// Customer order history - MUST come before /:id routes
router.get("/my", protect, async (req,res)=>{
  const orders = await Order.find({ orderedBy: req.user.id })
    .populate("items.product", "name price image")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// Update order status
const Sale = require("../models/Sale");

router.put("/:id/status", protect, async (req, res) => {
  try {
    console.log("Status update request:", req.params.id, req.body);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const order = await Order.findById(req.params.id)
      .populate("items.product");

    if (!order) {
      console.log("Order not found:", req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Current status:", order.status, "New status:", status);

    // If moving to 'in progress', reduce stock and create sales
    if (status === "in progress" && order.status === "pending") {
      for (let i of order.items) {
        // Reduce stock
        i.product.quantity -= i.quantity;
        await i.product.save();

        // Create Sale record
        await Sale.create({
          product: i.product._id,
          quantity: i.quantity,
          totalAmount: i.product.price * i.quantity,
          soldBy: req.user._id
        });
      }
    }

    order.status = status;
    await order.save();

    console.log("Order updated successfully");
    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats", protect, adminOnly, async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const pending = await Order.countDocuments({ status: "pending" });

  res.json({ totalOrders, pending });
});



module.exports = router;
