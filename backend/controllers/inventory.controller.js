const productService = require("../services/products.service");
const responseHandler = require("../helpers/responseHandler");

class InventoryController {
  // Kiểm tra tồn kho sản phẩm
  async checkStock(req, res) {
    try {
      const { productId } = req.params;
      const { quantity = 1 } = req.query;

      const result = await productService.checkStock(
        productId,
        parseInt(quantity)
      );

      if (result.success) {
        return responseHandler.success(res, result.data);
      } else {
        return responseHandler.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Error in checkStock:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }

  // Kiểm tra tồn kho nhiều sản phẩm
  async checkMultipleStock(req, res) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return responseHandler.error(res, "Items array is required", 400);
      }

      const result = await productService.checkMultipleStock(items);

      if (result.success) {
        return responseHandler.success(res, result.data);
      } else {
        return responseHandler.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Error in checkMultipleStock:", error);
      return responseHandler.error(res, "Internal server error", 500);
    }
  }
}

module.exports = new InventoryController();
