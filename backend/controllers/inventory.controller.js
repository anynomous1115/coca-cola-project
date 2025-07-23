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
        return responseHandler.successHandler(
          res,
          result.data,
          "Stock checked",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in checkStock:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // Kiểm tra tồn kho nhiều sản phẩm
  async checkMultipleStock(req, res) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "Items array is required",
        });
      }

      const result = await productService.checkMultipleStock(items);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          result.data,
          "Multiple stock checked",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in checkMultipleStock:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new InventoryController();
