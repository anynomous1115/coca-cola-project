const express = require("express");
const router = express.Router();
const aiApiController = require("../controllers/ai-api.controller");

// Routes cho AI Agent external
// Lấy danh sách sản phẩm
router.get("/products", aiApiController.getProductsForAI);

// Kiểm tra tồn kho
router.post("/check-stock", aiApiController.checkStockForAI);

// Tạo đơn hàng
router.post("/create-order", aiApiController.createOrderForAI);

// Lấy khuyến mãi
router.get("/promotions", aiApiController.getPromotionsForAI);

// Kiểm tra trạng thái đơn hàng
router.get("/order-status/:orderId", aiApiController.getOrderStatusForAI);

// Validate mã giảm giá
router.post("/validate-discount", aiApiController.validateDiscountForAI);

module.exports = router;
