const shippingService = require("../services/shipping.service");
const responseHandler = require("../helpers/responseHandler");

class ShippingController {
  // Lấy thông tin giao hàng
  async getShippingInfo(req, res) {
    try {
      const { orderId } = req.params;

      const result = await shippingService.getShippingInfo(orderId);

      if (result.success) {
        return responseHandler.success(res, result.data);
      } else {
        return responseHandler.error(res, result.message, 404);
      }
    } catch (error) {
      console.error("Error in getShippingInfo:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }

  // Cập nhật trạng thái giao hàng
  async updateShippingStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { shippingStatus } = req.body;

      if (!shippingStatus) {
        return responseHandler.error(res, "Shipping status is required", 400);
      }

      const result = await shippingService.updateShippingStatus(
        orderId,
        shippingStatus
      );

      if (result.success) {
        return responseHandler.success(res, result.data, result.message);
      } else {
        return responseHandler.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Error in updateShippingStatus:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }

  // Tính phí ship
  async calculateShippingFee(req, res) {
    try {
      const { address, weight = 1 } = req.body;

      if (!address) {
        return responseHandler.error(res, "Address is required", 400);
      }

      const shippingFee = shippingService.calculateShippingFee(address, weight);

      return responseHandler.success(res, {
        address,
        weight,
        shippingFee,
        currency: "VND",
      });
    } catch (error) {
      console.error("Error in calculateShippingFee:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }
}

module.exports = new ShippingController();
