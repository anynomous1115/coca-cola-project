const express = require("express");
const router = express.Router();
const promotionsController = require("../controllers/promotions.controller");

// Lấy khuyến mãi hiện hành
router.get("/active", promotionsController.getActivePromotions);

// // Validate mã giảm giá
// router.post("/validate", promotionsController.validateDiscount);

// // Tạo mã giảm giá (Admin)
// router.post("/create", promotionsController.createDiscount);

// // Thống kê khuyến mãi
// router.get("/stats/:discountCode", promotionsController.getPromotionStats);

module.exports = router;
