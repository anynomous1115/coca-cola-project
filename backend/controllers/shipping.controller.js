const shippingService = require("../services/shipping.service");
const responseHandler = require("../helpers/responseHandler");

class ShippingController {
  // Lấy thông tin giao hàng
  async getShippingInfo(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "OrderId is required",
        });
      }

      const result = await shippingService.getShippingInfo(orderId);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          "Shipping info retrieved",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 404,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in getShippingInfo:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // Lấy danh sách phương thức giao hàng
  async getShippingMethods(req, res) {
    try {
      const { weight, district } = req.query;

      const result = await shippingService.getShippingMethods({
        weight: weight ? parseFloat(weight) : undefined,
        district,
      });

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          "Shipping methods retrieved",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 404,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in getShippingMethods:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // Tính phí giao hàng
  async calculateShippingFee(req, res) {
    try {
      const { items, address } = req.body;

      if (!items || !items.length || !address) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "Items and address are required",
        });
      }

      const result = await shippingService.calculateShippingFee(items, address);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          "Shipping fee calculated",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in calculateShippingFee:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // Cập nhật trạng thái giao hàng
  async updateShippingStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, location, estimatedDelivery } = req.body;

      if (!orderId || !status) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "OrderId and status are required",
        });
      }

      const result = await shippingService.updateShippingStatus(orderId, {
        status,
        location,
        estimatedDelivery,
      });

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          "Shipping status updated",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 404,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in updateShippingStatus:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new ShippingController();
