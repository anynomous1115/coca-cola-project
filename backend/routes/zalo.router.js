const express = require("express");
const router = express.Router();
const zaloController = require("../controllers/zalo.controller");

// Webhook endpoint để nhận tin nhắn từ Zalo OA
router.post("/webhook", zaloController.handleWebhook);

// Test endpoint để gửi tin nhắn
router.post("/send-message", zaloController.sendTestMessage);

module.exports = router;
