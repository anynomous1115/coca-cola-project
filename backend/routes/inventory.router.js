const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

// Kiểm tra tồn kho sản phẩm
router.get("/check/:productId", inventoryController.checkStock);

// Kiểm tra tồn kho nhiều sản phẩm
router.post("/check-multiple", inventoryController.checkMultipleStock);

module.exports = router;
