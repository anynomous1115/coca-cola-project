const Order = require("../models/orders.model");
const Product = require("../models/products.model");
const User = require("../models/users.model");
const Discount = require("../models/discounts.model");
const productService = require("./products.service");

class OrderService {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const { userId, items, customerInfo, discountCode } = orderData;

      // Kiểm tra user
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Kiểm tra tồn kho
      const stockCheck = await productService.checkMultipleStock(items);
      if (!stockCheck.success || !stockCheck.data.allItemsAvailable) {
        return {
          success: false,
          message: "Some items are out of stock",
          data: stockCheck.data,
        };
      }

      // Tính tổng tiền
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }

      // Áp dụng discount
      let discountAmount = 0;
      if (discountCode) {
        const discountResult = await this.applyDiscount(
          discountCode,
          totalAmount
        );
        if (discountResult.success) {
          discountAmount = discountResult.discountAmount;
        }
      }

      const finalAmount = totalAmount - discountAmount;

      // Tạo order ID
      const orderId = `ORDER_${Date.now()}`;

      // Tạo đơn hàng
      const order = new Order({
        orderId,
        user: userId,
        items: orderItems,
        totalAmount: finalAmount,
        customerInfo,
        discountCode,
        discountAmount,
      });

      await order.save();

      // Cập nhật tồn kho
      for (const item of items) {
        await productService.updateStock(
          item.productId,
          item.quantity,
          "decrease"
        );
      }

      // Cập nhật số lần sử dụng discount
      if (discountCode && discountAmount > 0) {
        await Discount.findOneAndUpdate(
          { code: discountCode },
          { $inc: { usedCount: 1 } }
        );
      }

      return {
        success: true,
        data: {
          orderId,
          totalAmount: finalAmount,
          discountAmount,
          status: "pending",
        },
        message: "Order created successfully",
      };
    } catch (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        message: "Error creating order",
      };
    }
  }

  // Lấy thông tin đơn hàng
  async getOrder(orderId) {
    try {
      const order = await Order.findOne({ orderId })
        .populate("user", "name phone")
        .populate("items.product", "name price image");

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error("Error getting order:", error);
      return {
        success: false,
        message: "Error getting order",
      };
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findOneAndUpdate(
        { orderId },
        { status },
        { new: true }
      );

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      return {
        success: true,
        data: order,
        message: "Order status updated",
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        message: "Error updating order status",
      };
    }
  }

  // Áp dụng mã giảm giá
  async applyDiscount(discountCode, orderAmount) {
    try {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!discount) {
        return {
          success: false,
          message: "Invalid or expired discount code",
        };
      }

      // Kiểm tra số lần sử dụng
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        return {
          success: false,
          message: "Discount usage limit exceeded",
        };
      }

      // Kiểm tra đơn hàng tối thiểu
      if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
        return {
          success: false,
          message: `Minimum order amount of ${discount.minOrderAmount} required`,
        };
      }

      // Tính số tiền giảm
      let discountAmount = (orderAmount * discount.percentage) / 100;

      if (
        discount.maxDiscountAmount &&
        discountAmount > discount.maxDiscountAmount
      ) {
        discountAmount = discount.maxDiscountAmount;
      }

      return {
        success: true,
        discountAmount,
        discountPercentage: discount.percentage,
      };
    } catch (error) {
      console.error("Error applying discount:", error);
      return {
        success: false,
        message: "Error applying discount",
      };
    }
  }
}

module.exports = new OrderService();
