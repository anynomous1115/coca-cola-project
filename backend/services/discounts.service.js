const Discount = require("../models/discounts.model");

class DiscountService {
  // Lấy khuyến mãi hiện hành
  async getActivePromotions(userId = null) {
    try {
      const currentDate = new Date();

      let query = {
        isActive: true,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      };

      // Lọc những khuyến mãi chưa hết lượt sử dụng
      const promotions = await Discount.find(query)
        .select(
          "code name percentage maxDiscountAmount minOrderAmount usageLimit usedCount startDate endDate"
        )
        .sort({ percentage: -1 });

      const availablePromotions = promotions.filter((promo) => {
        return !promo.usageLimit || promo.usedCount < promo.usageLimit;
      });

      return {
        success: true,
        data: {
          promotions: availablePromotions,
          count: availablePromotions.length,
        },
      };
    } catch (error) {
      console.error("Error getting promotions:", error);
      return {
        success: false,
        message: "Error getting promotions",
      };
    }
  }

  // Validate mã giảm giá
  async validateDiscount(discountCode, orderAmount = 0) {
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
          message: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        };
      }

      // Kiểm tra số lần sử dụng
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        return {
          success: false,
          message: "Mã giảm giá đã hết lượt sử dụng",
        };
      }

      // Kiểm tra đơn hàng tối thiểu
      if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
        return {
          success: false,
          message: `Đơn hàng tối thiểu ${discount.minOrderAmount.toLocaleString(
            "vi-VN"
          )} VND để sử dụng mã này`,
        };
      }

      // Tính số tiền giảm
      let discountAmount = 0;
      if (orderAmount > 0) {
        discountAmount = (orderAmount * discount.percentage) / 100;

        if (
          discount.maxDiscountAmount &&
          discountAmount > discount.maxDiscountAmount
        ) {
          discountAmount = discount.maxDiscountAmount;
        }
      }

      return {
        success: true,
        data: {
          code: discount.code,
          name: discount.name,
          percentage: discount.percentage,
          maxDiscountAmount: discount.maxDiscountAmount,
          minOrderAmount: discount.minOrderAmount,
          discountAmount,
          remainingUsage: discount.usageLimit
            ? discount.usageLimit - discount.usedCount
            : null,
        },
        message: "Mã giảm giá hợp lệ",
      };
    } catch (error) {
      console.error("Error validating discount:", error);
      return {
        success: false,
        message: "Lỗi khi kiểm tra mã giảm giá",
      };
    }
  }

  // Tạo mã giảm giá mới (Admin)
  async createDiscount(discountData) {
    try {
      const {
        code,
        name,
        percentage,
        maxDiscountAmount,
        minOrderAmount,
        startDate,
        endDate,
        usageLimit,
      } = discountData;

      // Kiểm tra mã đã tồn tại
      const existingDiscount = await Discount.findOne({
        code: code.toUpperCase(),
      });
      if (existingDiscount) {
        return {
          success: false,
          message: "Mã giảm giá đã tồn tại",
        };
      }

      const discount = new Discount({
        code: code.toUpperCase(),
        name,
        percentage,
        maxDiscountAmount,
        minOrderAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit,
      });

      await discount.save();

      return {
        success: true,
        data: discount,
        message: "Tạo mã giảm giá thành công",
      };
    } catch (error) {
      console.error("Error creating discount:", error);
      return {
        success: false,
        message: "Lỗi khi tạo mã giảm giá",
      };
    }
  }

  // Lấy thống kê khuyến mãi
  async getPromotionStats(discountCode) {
    try {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
      });

      if (!discount) {
        return {
          success: false,
          message: "Mã giảm giá không tồn tại",
        };
      }

      const stats = {
        code: discount.code,
        name: discount.name,
        totalUsage: discount.usedCount,
        remainingUsage: discount.usageLimit
          ? discount.usageLimit - discount.usedCount
          : "Không giới hạn",
        usageRate: discount.usageLimit
          ? ((discount.usedCount / discount.usageLimit) * 100).toFixed(2) + "%"
          : null,
        status: discount.isActive ? "Active" : "Inactive",
        validPeriod: {
          start: discount.startDate,
          end: discount.endDate,
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error getting promotion stats:", error);
      return {
        success: false,
        message: "Lỗi khi lấy thống kê khuyến mãi",
      };
    }
  }
}

module.exports = new DiscountService();
