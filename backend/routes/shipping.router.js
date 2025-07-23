const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shipping.controller");

// Lấy thông tin giao hàng
router.get("/info/:orderId", shippingController.getShippingInfo);

// Cập nhật trạng thái giao hàng
router.put("/status/:orderId", shippingController.updateShippingStatus);

// Tính phí ship
router.post("/calculate-fee", shippingController.calculateShippingFee);

module.exports = router;
