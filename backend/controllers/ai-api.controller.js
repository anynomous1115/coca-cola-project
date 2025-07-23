const productService = require("../services/products.service");
const orderService = require("../services/orders.service");
const discountService = require("../services/discounts.service");
const shippingService = require("../services/shipping.service");
const responseHandler = require("../helpers/responseHandler");

class AIApiController {
  // API cho AI Agent lấy thông tin sản phẩm
  async getProductsForAI(req, res) {
    try {
      const { category, search, limit = 10 } = req.query;

      const result = await productService.getProducts({
        category,
        search,
        limit: parseInt(limit),
        page: 1,
      });

      if (result.success) {
        // Format dữ liệu cho AI Agent
        const aiFormattedProducts = result.data.products.map((product) => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image: product.image,
          available: product.isActive && product.stock > 0,
        }));

        return responseHandler.successHandler(
          res,
          {
            products: aiFormattedProducts,
            total: result.data.pagination.total,
          },
          "Products retrieved for AI",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("❌ AI get products error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to get products for AI",
      });
    }
  }

  // API cho AI Agent kiểm tra tồn kho
  async checkStockForAI(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "Product ID is required",
        });
      }

      const result = await productService.checkStock(productId, quantity);

      if (result.success) {
        return responseHandler.successHandler(
          res,
          {
            productId: result.data.productId,
            productName: result.data.productName,
            available: result.data.isAvailable,
            currentStock: result.data.currentStock,
            requestedQuantity: result.data.requestedQuantity,
            canFulfill: result.data.canFulfill,
          },
          "Stock checked for AI",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("❌ AI check stock error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to check stock for AI",
      });
    }
  }

  // API cho AI Agent tạo đơn hàng
  async createOrderForAI(req, res) {
    try {
      const { userId, items, customerInfo, discountCode } = req.body;

      if (!userId || !items || !customerInfo) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "userId, items, and customerInfo are required",
        });
      }

      const result = await orderService.createOrder({
        userId,
        items,
        customerInfo,
        discountCode,
      });

      if (result.success) {
        return responseHandler.successHandler(
          res,
          {
            orderId: result.data.orderId,
            totalAmount: result.data.totalAmount,
            discountAmount: result.data.discountAmount,
            status: result.data.status,
            message: "Order created successfully",
          },
          "Order created for AI",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
          data: result.data,
        });
      }
    } catch (error) {
      console.error("❌ AI create order error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to create order for AI",
      });
    }
  }

  // API cho AI Agent lấy khuyến mãi
  async getPromotionsForAI(req, res) {
    try {
      const { userId } = req.query;

      const result = await discountService.getActivePromotions(userId);

      if (result.success) {
        // Format cho AI Agent
        const aiFormattedPromotions = result.data.promotions.map((promo) => ({
          code: promo.code,
          name: promo.name,
          percentage: promo.percentage,
          maxDiscount: promo.maxDiscountAmount,
          minOrder: promo.minOrderAmount,
          usageLeft: promo.usageLimit
            ? promo.usageLimit - promo.usedCount
            : null,
          endDate: promo.endDate,
        }));

        return responseHandler.successHandler(
          res,
          {
            promotions: aiFormattedPromotions,
            count: aiFormattedPromotions.length,
          },
          "Promotions retrieved for AI",
          200
        );
      } else {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("❌ AI get promotions error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to get promotions for AI",
      });
    }
  }

  // API cho AI Agent kiểm tra trạng thái đơn hàng
  async getOrderStatusForAI(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "Order ID is required",
        });
      }

      const orderResult = await orderService.getOrder(orderId);

      if (!orderResult.success) {
        return responseHandler.errorHandler(res, {
          code: 404,
          message: "Order not found",
        });
      }

      const shippingResult = await shippingService.getShippingInfo(orderId);

      return responseHandler.successHandler(
        res,
        {
          orderId: orderResult.data.orderId,
          status: orderResult.data.status,
          totalAmount: orderResult.data.totalAmount,
          customerInfo: orderResult.data.customerInfo,
          items: orderResult.data.items,
          shipping: shippingResult.success ? shippingResult.data : null,
          createdAt: orderResult.data.createdAt,
        },
        "Order status retrieved for AI",
        200
      );
    } catch (error) {
      console.error("❌ AI get order status error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to get order status for AI",
      });
    }
  }

  // API validation mã giảm giá cho AI Agent
  async validateDiscountForAI(req, res) {
    try {
      const { discountCode, orderAmount = 0 } = req.body;

      if (!discountCode) {
        return responseHandler.errorHandler(res, {
          code: 400,
          message: "Discount code is required",
        });
      }

      const result = await discountService.validateDiscount(
        discountCode,
        orderAmount
      );

      if (result.success) {
        return responseHandler.successHandler(
          res,
          {
            valid: true,
            code: result.data.code,
            name: result.data.name,
            percentage: result.data.percentage,
            discountAmount: result.data.discountAmount,
            maxDiscount: result.data.maxDiscountAmount,
            minOrder: result.data.minOrderAmount,
          },
          "Discount validated for AI",
          200
        );
      } else {
        return responseHandler.successHandler(
          res,
          {
            valid: false,
            message: result.message,
          },
          "Discount validation result",
          200
        );
      }
    } catch (error) {
      console.error("❌ AI validate discount error:", error);
      return responseHandler.errorHandler(res, {
        code: 500,
        message: "Failed to validate discount for AI",
      });
    }
  }
}

module.exports = new AIApiController();
