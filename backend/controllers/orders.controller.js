const { error, success } = require("../helpers/responseHandler");
const OrderService = require("../services/orders.service");

class OrderController {
  async createOrder(req, res) {
    try {
      const result = await OrderService.createOrder(req.body);
      if (!result.success) {
        return error(res, { code: 400, message: result.message, details: result.data });
      }
      return success(res, result.data, result.message, 201);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }

  async getOrder(req, res) {
    try {
      const result = await OrderService.getOrder(req.params.orderId);
      if (!result.success) {
        return error(res, { code: 404, message: result.message });
      }
      return success(res, result.data, result.message);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const result = await OrderService.updateOrderStatus(req.params.orderId, req.body.status);
      if (!result.success) {
        return error(res, { code: 400, message: result.message });
      }
      return success(res, result.data, result.message);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }

  async editOrder(req, res) {
    try {
      const result = await OrderService.editOrder(req.params.orderId, req.body);
      if (!result.success) {
        return error(res, { code: 400, message: result.message });
      }
      return success(res, result.data, result.message);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }

  async cancelOrder(req, res) {
    try {
      const result = await OrderService.cancelOrder(req.params.orderId);
      if (!result.success) {
        return error(res, { code: 400, message: result.message });
      }
      return success(res, result.data, result.message);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }

  async updateOrderCOD(req, res) {
    try {
      const result = await OrderService.updateOrderCOD(req.params.orderId, req.body.codAmount);
      if (!result.success) {
        return error(res, { code: 400, message: result.message });
      }
      return success(res, result.data, result.message);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }

  async returnOrder(req, res) {
    try {
      const result = await OrderService.returnOrder(req.params.orderId);
      if (!result.success) {
        return error(res, { code: 400, message: result.message });
      }
      return success(res, result.data, result.message);
    } catch (err) {
      return error(res, { code: 500, message: `Internal server error: ${err.message}` });
    }
  }
}

module.exports = new OrderController();
