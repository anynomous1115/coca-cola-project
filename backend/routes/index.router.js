const express = require("express");
const router = express.Router();

// Import all routers
const ordersRouter = require("./orders.router");
const inventoryRouter = require("./inventory.router");
const promotionsRouter = require("./promotions.router");
const shippingRouter = require("./shipping.router");

// Use routers
router.use("/orders", ordersRouter);
router.use("/inventory", inventoryRouter);
router.use("/promotions", promotionsRouter);
router.use("/shipping", shippingRouter);

module.exports = router;
