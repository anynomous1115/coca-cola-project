const Order = require("../models/orders.model");

class ShippingService {
  // Gửi thông tin giao hàng
  async getShippingInfo(orderId) {
    try {
      const order = await Order.findOne({ orderId })
        .populate("user", "name phone")
        .populate("items.product", "name");

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Mock thông tin giao hàng
      const shippingInfo = {
        orderId: order.orderId,
        status: order.status,
        customer: {
          name: order.customerInfo.name,
          phone: order.customerInfo.phone,
          address: order.customerInfo.address,
        },
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
        })),
        totalAmount: order.totalAmount,
        trackingNumber: `SHIP${orderId.slice(-6)}`,
        estimatedDelivery: this.calculateDeliveryTime(),
        shippingStatus: this.getShippingStatus(order.status),
      };

      return {
        success: true,
        data: shippingInfo,
      };
    } catch (error) {
      console.error("Error getting shipping info:", error);
      return {
        success: false,
        message: "Error getting shipping info",
      };
    }
  }

  // Cập nhật trạng thái giao hàng
  async updateShippingStatus(orderId, shippingStatus) {
    try {
      // Map shipping status to order status
      const statusMap = {
        preparing: "confirmed",
        picked_up: "shipping",
        in_transit: "shipping",
        delivered: "delivered",
      };

      const orderStatus = statusMap[shippingStatus] || "pending";

      const order = await Order.findOneAndUpdate(
        { orderId },
        { status: orderStatus },
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
        data: {
          orderId,
          orderStatus,
          shippingStatus,
          updatedAt: new Date(),
        },
        message: "Shipping status updated",
      };
    } catch (error) {
      console.error("Error updating shipping status:", error);
      return {
        success: false,
        message: "Error updating shipping status",
      };
    }
  }

  // Tính thời gian giao hàng dự kiến
  calculateDeliveryTime() {
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
    return deliveryDate;
  }

  // Lấy trạng thái giao hàng từ trạng thái đơn hàng
  getShippingStatus(orderStatus) {
    const statusMap = {
      pending: "processing",
      confirmed: "preparing",
      shipping: "in_transit",
      delivered: "delivered",
      cancelled: "cancelled",
    };

    return statusMap[orderStatus] || "unknown";
  }

  // Tính phí ship (mock)
  calculateShippingFee(address, weight = 1) {
    // Mock calculation
    const baseShippingFee = 25000; // 25k VND
    const weightFee = weight > 1 ? (weight - 1) * 5000 : 0;

    return baseShippingFee + weightFee;
  }
}

module.exports = new ShippingService();
