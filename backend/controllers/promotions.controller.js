const discountService = require("../services/discounts.service");
const responseHandler = require("../helpers/responseHandler");

class PromotionsController {
  async getActivePromotions(req, res) {
    try {
      const { userId } = req.query;

      const result = await discountService.getActivePromotions(userId);

      if (result.success) {
        return responseHandler.success(res, result.data);
      } else {
        return responseHandler.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Error in getActivePromotions:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }

  //   // Validate mã giảm giá
  //   async validateDiscount(req, res) {
  //     try {
  //       const { discountCode, orderAmount = 0 } = req.body;

  //       if (!discountCode) {
  //         return responseHandler.error(res, "Discount code is required", 400);
  //       }

  //       const result = await discountService.validateDiscount(
  //         discountCode,
  //         orderAmount
  //       );

  //       if (result.success) {
  //         return responseHandler.success(res, result.data, result.message);
  //       } else {
  //         return responseHandler.error(res, result.message, 400);
  //       }
  //     } catch (error) {
  //       console.error("Error in validateDiscount:", error);
  //       return responseHandler.error(res, "Internal server error", 500);
  //     }
  //   }

  //   // Tạo mã giảm giá (Admin)
  //   async createDiscount(req, res) {
  //     try {
  //       const discountData = req.body;

  //       const result = await discountService.createDiscount(discountData);

  //       if (result.success) {
  //         return responseHandler.success(res, result.data, result.message);
  //       } else {
  //         return responseHandler.error(res, result.message, 400);
  //       }
  //     } catch (error) {
  //       console.error("Error in createDiscount:", error);
  //       return responseHandler.error(res, "Internal server error", 500);
  //     }
  //   }

  //   // Thống kê khuyến mãi
  //   async getPromotionStats(req, res) {
  //     try {
  //       const { discountCode } = req.params;

  //       const result = await discountService.getPromotionStats(discountCode);

  //       if (result.success) {
  //         return responseHandler.success(res, result.data);
  //       } else {
  //         return responseHandler.error(res, result.message, 404);
  //       }
  //     } catch (error) {
  //       console.error("Error in getPromotionStats:", error);
  //       return responseHandler.error(res, "Internal server error", 500);
  //     }
  //   }
}

module.exports = new PromotionsController();
