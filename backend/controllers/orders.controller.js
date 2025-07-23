const orderService = require("../services/orders.service");
const responseHandler = require("../helpers/responseHandler");

class OrdersController {
  // Tạo đơn hàng
  async createOrder(req, res) {
    try {
      const orderData = req.body;

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        return responseHandler.success(res, result.data, result.message);
      } else {
        return responseHandler.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Error in createOrder:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }

  // Lấy thông tin đơn hàng
  async getOrder(req, res) {
    try {
      const { orderId } = req.params;

      const result = await orderService.getOrder(orderId);

      if (result.success) {
        return responseHandler.success(res, result.data);
      } else {
        return responseHandler.error(res, result.message, 404);
      }
    } catch (error) {
      console.error("Error in getOrder:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return responseHandler.error(res, "Status is required", 400);
      }

      const result = await orderService.updateOrderStatus(orderId, status);

      if (result.success) {
        return responseHandler.success(res, result.data, result.message);
      } else {
        return responseHandler.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }
}

module.exports = new OrdersController();
