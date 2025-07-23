const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

// Tạo đơn hàng mới
router.post("/create", ordersController.createOrder);

// Lấy thông tin đơn hàng
router.get("/:orderId", ordersController.getOrder);

// Cập nhật trạng thái đơn hàng
router.put("/:orderId/status", ordersController.updateOrderStatus);

module.exports = router;
