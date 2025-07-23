const express = require("express");
const router = express.Router();

// Import all routers
const ordersRouter = require("./orders.router");
const inventoryRouter = require("./inventory.router");
const promotionsRouter = require("./promotions.router");
const shippingRouter = require("./shipping.router");
// const zaloRouter = require("./zalo.router");
const aiApiRouter = require("./ai-api.router");

// Use routers
router.use("/orders", ordersRouter);
router.use("/inventory", inventoryRouter);
router.use("/promotions", promotionsRouter);
router.use("/shipping", shippingRouter);
// router.use("/zalo", zaloRouter);
router.use("/ai", aiApiRouter);

module.exports = router;
