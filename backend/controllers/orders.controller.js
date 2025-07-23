const orderService = require("../services/orders.service");
const responseHandler = require("../helpers/responseHandler");

class OrdersController {
  // Tạo đơn hàng
  async createOrder(req, res) {
    try {
      const orderData = req.body;

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          result.message,
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in createOrder:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // Lấy thông tin đơn hàng
  async getOrder(req, res) {
    try {
      const { orderId } = req.params;

      const result = await orderService.getOrder(orderId);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          "Order retrieved",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 404,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in getOrder:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "Status is required",
        });
      }

      const result = await orderService.updateOrderStatus(orderId, status);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          result.message,
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new OrdersController();
