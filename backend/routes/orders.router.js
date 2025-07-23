const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

// Tạo đơn hàng mới
router.post("/create", ordersController.createOrder);

// Lấy thông tin đơn hàng theo ID
router.get("/:orderId", ordersController.getOrder);

// Cập nhật trạng thái đơn hàng
router.put("/:orderId/status", ordersController.updateOrderStatus);

// Chỉnh sửa đơn hàng
router.put("/:orderId", ordersController.editOrder);

// Hủy đơn hàng
router.put("/:orderId/cancel", ordersController.cancelOrder);

// Cập nhật tiền thu hộ (COD) cho đơn hàng
router.put("/:orderId/cod", ordersController.updateOrderCOD);

// Trả hàng
router.put("/:orderId/return", ordersController.returnOrder);

module.exports = router;
