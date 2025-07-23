const zaloService = require("../services/zalo.service");
const aiService = require("../services/ai.service");
const responseHandler = require("../helpers/responseHandler");

class ZaloController {
  // Webhook nhận tin nhắn từ Zalo OA
  async handleWebhook(req, res) {
    try {
      const { event_name, app_id, user_id_by_app, data } = req.body;

      console.log("📱 Zalo webhook received:", { event_name, user_id_by_app });

      if (event_name === "user_send_text") {
        // Xử lý tin nhắn văn bản
        const userMessage = data.content;
        const zaloUserId = user_id_by_app;

        // Gửi cho AI Agent xử lý
        const aiResponse = await aiService.processMessage({
          userId: zaloUserId,
          message: userMessage,
          platform: "zalo",
        });

        // Gửi response về Zalo
        await zaloService.sendMessage(zaloUserId, aiResponse);
      } else if (event_name === "user_send_image") {
        // Xử lý hình ảnh (có thể là ảnh sản phẩm để tìm kiếm)
        const imageUrl = data.content;

        const aiResponse = await aiService.processImage({
          userId: user_id_by_app,
          imageUrl: imageUrl,
        });

        await zaloService.sendMessage(user_id_by_app, aiResponse);
      }

      return responseHandler.successHandler(
        res,
        null,
        "Webhook processed",
        200
      );
    } catch (error) {
      console.error("❌ Zalo webhook error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Webhook processing failed",
      });
    }
  }

  // Test gửi tin nhắn
  async sendTestMessage(req, res) {
    try {
      const { userId, message } = req.body;

      const result = await zaloService.sendMessage(userId, message);

      return responseHandler.successHandler(res, result, "Message sent", 200);
    } catch (error) {
      console.error("❌ Send message error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to send message",
      });
    }
  }
}

module.exports = new ZaloController();
