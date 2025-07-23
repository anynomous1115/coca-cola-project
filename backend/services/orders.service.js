const Order = require("../models/orders.model");
const Product = require("../models/products.model");
const User = require("../models/users.model");
const Discount = require("../models/discounts.model");
const productService = require("./products.service");
const axios = require("axios");

const ghnApiUrl = process.env.GHN_API_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const ghnToken = process.env.GHN_TOKEN || "0b7602b4-6781-11f0-9b81-222185cb68c8";
const ghnShopId = process.env.GHN_SHOP_ID || "197167";

// Helper: Get GHN API headers
const getGhnHeaders = function (shopId = false) {
  const headers = { "Content-Type": "application/json", Token: ghnToken };
  if (shopId) headers.ShopId = ghnShopId;
  return headers;
};

// Helper: Validate district
const validateDistrict = async function (districtId,provinceId) {
  try {
    const { data } = await axios.get(`${ghnApiUrl}/master-data/district`, {
      headers: getGhnHeaders(),
      params: { province_id: provinceId },
    });
    if (data.code !== 200 || !data.data) throw new Error("Failed to fetch district data");
    return data.data.some(d => d.DistrictID === districtId);
  } catch (error) {
    throw new Error(`District validation failed: ${error.message}`);
  }
};

// Helper: Validate ward
const validateWard = async function (districtId, wardCode) {
  try {
    const { data } = await axios.get(`${ghnApiUrl}/master-data/ward`, {
      headers: getGhnHeaders(),
      params: { district_id: districtId },
    });
    if (data.code !== 200 || !data.data) throw new Error("Failed to fetch ward data");
    return data.data.some(w => w.WardCode === wardCode);
  } catch (error) {
    throw new Error(`Ward validation failed: ${error.message}`);
  }
};

// Helper: Validate service
const validateService = async function (shopDistrictId, toDistrictId, serviceId) {
  try {
    const { data } = await axios.post(
      `${ghnApiUrl}/v2/shipping-order/available-services`,
      { shop_id: parseInt(ghnShopId), from_district: shopDistrictId, to_district: toDistrictId },
      { headers: getGhnHeaders() }
    );
    if (data.code !== 200 || !data.data) throw new Error("Failed to fetch available services");
    return data.data.some(s => s.service_id === serviceId);
  } catch (error) {
    throw new Error(`Service validation failed: ${error.message}`);
  }
};

// Helper: Fetch shop data
const fetchShopData = async function () {
  try {
    const { data } = await axios.get(`${ghnApiUrl}/v2/shop/all`, {
      headers: getGhnHeaders(),
      params: { offset: 0, limit: 1 },
    });
    if (data.code !== 200 || !data.data?.shops?.[0]) throw new Error("Failed to fetch shop data");
    return data.data.shops[0];
  } catch (error) {
    throw new Error(`Shop data fetch failed: ${error.message}`);
  }
};

// Helper: Calculate shipping fee
const calculateShippingFee = async function (shopData, deliver, products) {
  try {
    const { data } = await axios.post(
      `${ghnApiUrl}/v2/shipping-order/fee`,
      {
        from_district_id: shopData.district_id,
        from_ward_code: shopData.ward_code,
        service_id: deliver.service_id,
        to_district_id: deliver.districtId,
        to_ward_code: deliver.wardCode,
        height: 50,
        length: 20,
        weight: 200,
        width: 20,
        insurance_value: 10000,
        cod_failed_amount: 2000,
        items: products.map(item => ({
          name: item.productName || "TEST1",
          quantity: item.quantity,
          height: 200,
          weight: 1000,
          length: 200,
          width: 200,
        })),
      },
      { headers: getGhnHeaders(true) }
    );
    if (data.code !== 200 || !data.data) throw new Error("Failed to calculate shipping fee");
    return data.data.total || 0;
  } catch (error) {
    throw new Error(`Shipping fee calculation failed: ${error.message}`);
  }
};

// Helper: Calculate lead time
const calculateLeadTime = async function (shopData, deliver) {
  try {
    const { data } = await axios.post(
      `${ghnApiUrl}/v2/shipping-order/leadtime`,
      {
        from_district_id: shopData.district_id,
        from_ward_code: shopData.ward_code,
        to_district_id: deliver.districtId,
        to_ward_code: deliver.wardCode,
        service_id: deliver.service_id,
      },
      { headers: getGhnHeaders(true) }
    );
    if (data.code !== 200 || !data.data) throw new Error("Failed to calculate lead time");
    return new Date(data.data.leadtime * 1000);
  } catch (error) {
    throw new Error(`Lead time calculation failed: ${error.message}`);
  }
};

const OrderService = {
  // Tạo đơn hàng mới
  createOrder: async function (orderData) {
    if (!orderData || typeof orderData !== "object") {
      return { success: false, message: "Invalid request body: JSON object expected" };
    }

    const { user, products, coupons, deliver } = orderData;
    if (!user?.name || !user?.phone_number || !products?.length || !deliver?.address || !deliver?.districtId || !deliver?.wardCode) {
      return { success: false, message: "Missing required fields" };
    }

    try {
      // Kiểm tra hoặc tạo user
      let dbUser = await User.findOne({ phone: user.phone_number });
      if (!dbUser) {
        dbUser = await new User({ name: user.name, phone: user.phone_number }).save();
      }

      // Kiểm tra sản phẩm và tính tổng tiền
      const orderItems = [];
      let totalAmount = 0;
      for (const item of products) {
        const product = await Product.findById(item.id);
        if (!product) return { success: false, message: `Product with ID ${item.id} not found` };
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

      // Kiểm tra tồn kho
      const stockCheck = await productService.checkMultipleStock(products.map(p => ({ productId: p.id, quantity: p.quantity })));
      if (!stockCheck.success || !stockCheck.data.allItemsAvailable) {
        return { success: false, message: "Some items are out of stock", data: stockCheck.data };
      }

      // Validate GHN delivery information
      const shopData = await fetchShopData();
      const toDistrict = await validateDistrict(deliver.districtId,deliver.provinceId);
      if (!toDistrict) return { success: false, message: "Invalid district ID" };
      const toWard = await validateWard(deliver.districtId, deliver.wardCode);
      if (!toWard) return { success: false, message: "Invalid ward code" };

      // Use default service_id if not provided or invalid
      const serviceId = deliver.service_id && deliver.service_id !== 0
        ? (await validateService(shopData.district_id, deliver.districtId, deliver.service_id) ? deliver.service_id : null)
        : await getDefaultServiceId(shopData.district_id, deliver.districtId);
      if (!serviceId) return { success: false, message: "No valid service ID available" };

      // Enhance addresses
      const toAddress = `${deliver.address}, ${toWard.WardName}, ${toDistrict.DistrictName}, Hồ Chí Minh`;
      const returnAddress = `${shopData.address}, ${shopData.ward_name || 'Unknown Ward'}, ${shopData.district_name || 'Unknown District'}, Hồ Chí Minh`;

      // Tính phí giao hàng và thời gian giao
      const shippingFee = await calculateShippingFee(shopData, { ...deliver, service_id: serviceId }, products);
      const leadtime = await calculateLeadTime(shopData, { ...deliver, service_id: serviceId });

      // Áp dụng discount
      let discountAmount = 0;
      let appliedDiscountCode = null;
      if (coupons?.length) {
        for (const coupon of coupons) {
          const discountResult = await this.applyDiscount(coupon, totalAmount);
          if (discountResult.success) {
            discountAmount = discountResult.discountAmount;
            appliedDiscountCode = coupon;
            break;
          }
        }
      }

      const finalAmount = totalAmount + shippingFee - discountAmount;
      const orderId = `ORDER_${Date.now()}`;

      // Tạo đơn hàng
      const order = new Order({
        orderId,
        user: dbUser._id,
        items: orderItems,
        totalAmount: finalAmount,
        shippingFee,
        customerInfo: {
          name: user.name,
          phone: user.phone_number,
          address: toAddress,
          districtId: deliver.districtId,
          wardCode: deliver.wardCode,
        },
        discountCode: appliedDiscountCode,
        discountAmount,
        leadtime,
      });
      await order.save();
      // Tạo đơn hàng trên GHN
      try {
        const totalWeight = products.reduce((sum, item) => sum + (item.quantity * 1200), 0);
        const { data } = await axios.post(
          `${ghnApiUrl}/v2/shipping-order/create`,
          {
            payment_type_id: 1,
            note: "Tintest 123",
            required_note: "KHONGCHOXEMHANG",
            from_name: shopData.name || "Hello",
            from_phone: shopData.phone || "0987654321",
            from_address: shopData.address || "72 Thành Thái, Phường 14, Quận 10, Hồ Chí Minh, Vietnam",
            from_district_id: shopData.district_id,
            from_ward_code: shopData.ward_code,
            return_phone: shopData.phone || "0332190444",
            return_address: returnAddress,
            return_district_id: shopData.district_id,
            return_ward_code: shopData.ward_code,
            client_order_code: orderId,
            to_name: user.name,
            to_phone: user.phone_number,
            to_address: toAddress,
            to_ward_code: deliver.wardCode,
            to_district_id: deliver.districtId,
            cod_amount: finalAmount,
            content: "Theo New York Times",
            weight: totalWeight,
            length: 20,
            width: 20,
            height: 50,
            pick_station_id: shopData.pick_station_id || 1444,
            deliver_station_id: null,
            insurance_value: 5000000,
            service_id: serviceId,
            service_type_id: 2,
            pick_shift: [2],
            items: products.map(item => ({
              name: item.productName || "Áo Polo",
              code: item.id || "Polo123",
              quantity: item.quantity,
              price: item.price || 200000,
              length: 12,
              width: 12,
              height: 12,
              weight: 1200,
              category: { level1: "Áo" },
            })),
          },
          { headers: getGhnHeaders(true) }
        );

        if (data.code !== 200 || !data.data) {
          await Order.findOneAndDelete({ orderId });
          return { success: false, message: `Failed to create shipping order with GHN: ${data.message || "Unknown error"}`, code: data.code || 400 };
        }

        order.ghnOrderCode = data.data.order_code;
        await order.save();
      } catch (error) {
        await Order.findOneAndDelete({ orderId });
        return { success: false, message: `GHN order creation failed: ${error.response?.data?.message || error.message}`, code: error.response?.status || 400 };
      }

      // Cập nhật tồn kho và discount
      for (const item of products) {
        await productService.updateStock(item.id, item.quantity, "decrease");
      }
      if (appliedDiscountCode && discountAmount > 0) {
        await Discount.findOneAndUpdate({ code: appliedDiscountCode }, { $inc: { usedCount: 1 } });
      }

      return {
        success: true,
        data: { orderId, totalAmount: finalAmount, shippingFee, discountAmount, status: "ready_to_pick", ghnOrderCode: order.ghnOrderCode, leadtime },
        message: "Order created successfully",
      };
    } catch (error) {
      return { success: false, message: `Error creating order: ${error.message}` };
    }
  },


  // Lấy thông tin đơn hàng
  getOrder: async function (orderId) {
    try {
      const order = await Order.findOne({ orderId })
        .populate("user", "name phone")
        .populate("items.product", "name price image");
      if (!order) return { success: false, message: "Order not found" };

      // Fetch GHN order details
      let ghnDetails = null;
      if (order.ghnOrderCode) {
        try {
          const { data } = await axios.post(
            `${ghnApiUrl}/v2/shipping-order/detail`,
            { order_code: order.ghnOrderCode },
            { headers: getGhnHeaders() }
          );
          if (data.code === 200 && data.data?.[0]) {
            const ghnData = data.data[0];
            ghnDetails = {
              ghnStatus: ghnData.status,
              ghnLeadtime: ghnData.leadtime ? new Date(ghnData.leadtime) : null,
              codAmount: ghnData.cod_amount,
              log: ghnData.log.map(log => ({ status: log.status, updated_date: new Date(log.updated_date) })),
            };
          }
        } catch (error) {
          console.warn(`GHN order detail error: ${error.message}`);
        }
      }

      return {
        success: true,
        data: { ...order.toObject(), ghnDetails },
        message: ghnDetails ? "Order retrieved successfully with GHN details" : "Order retrieved successfully, GHN details unavailable",
      };
    } catch (error) {
      return { success: false, message: `Error getting order: ${error.message}` };
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async function (orderId, status) {
    try {
      const order = await Order.findOneAndUpdate({ orderId }, { status }, { new: true });
      if (!order) return { success: false, message: "Order not found" };
      return { success: true, data: order, message: "Order status updated" };
    } catch (error) {
      return { success: false, message: `Error updating order status: ${error.message}` };
    }
  },

  // Sửa đơn hàng
  editOrder: async function (orderId, updateData) {
    const { customerInfo, note } = updateData;
    if (!customerInfo) return { success: false, message: "No valid customer information provided" };

    try {
      const order = await Order.findOne({ orderId });
      if (!order) return { success: false, message: "Order not found" };
      if (!["ready_to_pick", "picking"].includes(order.status)) {
        return { success: false, message: "Order cannot be edited in current status" };
      }

      // Validate district and ward if updated
      const allowedUpdates = {};
      if (customerInfo.name) allowedUpdates.name = customerInfo.name;
      if (customerInfo.address) allowedUpdates.address = customerInfo.address;
      if (customerInfo.phone) allowedUpdates.phone = customerInfo.phone;
      if (customerInfo.districtId) allowedUpdates.districtId = customerInfo.districtId;
      if (customerInfo.wardCode) allowedUpdates.wardCode = customerInfo.wardCode;
      if (customerInfo.provinceId) allowedUpdates.provinceId = customerInfo.provinceId;

      if (allowedUpdates.districtId && !(await validateDistrict(allowedUpdates.districtId,allowedUpdates.provinceId))) {
        return { success: false, message: "Invalid district ID" };
      }
      if (allowedUpdates.wardCode && !(await validateWard(allowedUpdates.districtId || order.customerInfo.districtId, allowedUpdates.wardCode))) {
        return { success: false, message: "Invalid ward code" };
      }

      // Update GHN order
      if (order.ghnOrderCode) {
        try {
          const { data } = await axios.post(
            `${ghnApiUrl}/v2/shipping-order/update`,
            {
              order_code: order.ghnOrderCode,
              to_name: allowedUpdates.name || order.customerInfo.name,
              to_phone: allowedUpdates.phone || order.customerInfo.phone,
              to_address: allowedUpdates.address || order.customerInfo.address,
              to_ward_code: allowedUpdates.wardCode || order.customerInfo.wardCode,
              to_district_id: allowedUpdates.districtId || order.customerInfo.districtId,
              note: note || "Updated order information",
            },
            { headers: getGhnHeaders(true) }
          );
          if (data.code !== 200 || !data.data) throw new Error("Failed to update shipping order with GHN");
        } catch (error) {
          return { success: false, message: `GHN order update failed: ${error.message}` };
        }
      }

      // Apply updates
      order.customerInfo = { ...order.customerInfo, ...allowedUpdates };
      await order.save();
      return { success: true, data: order, message: "Order updated successfully" };
    } catch (error) {
      return { success: false, message: `Error editing order: ${error.message}` };
    }
  },

  // Hủy đơn hàng
  cancelOrder: async function (orderId) {
    try {
      const order = await Order.findOne({ orderId });
      if (!order) return { success: false, message: "Order not found" };
      if (!["ready_to_pick", "picking"].includes(order.status)) {
        return { success: false, message: "Order cannot be cancelled in current status" };
      }

      // Cancel GHN order
      if (order.ghnOrderCode) {
        try {
          const { data } = await axios.post(
            `${ghnApiUrl}/v2/switch-status/cancel`,
            { order_codes: [order.ghnOrderCode] },
            { headers: getGhnHeaders(true) }
          );
          if (data.code !== 200 || !data.data) throw new Error("Failed to cancel shipping order with GHN");
        } catch (error) {
          return { success: false, message: `GHN order cancel failed: ${error.message}` };
        }
      }

      // Hoàn tồn kho và cập nhật discount
      for (const item of order.items) {
        await productService.updateStock(item.product, item.quantity, "increase");
      }
      if (order.discountCode && order.discountAmount > 0) {
        await Discount.findOneAndUpdate({ code: order.discountCode }, { $inc: { usedCount: -1 } });
      }

      order.status = "cancel";
      await order.save();
      return { success: true, data: order, message: "Order cancelled successfully" };
    } catch (error) {
      return { success: false, message: `Error cancelling order: ${error.message}` };
    }
  },

  // Trả hàng
  returnOrder: async function (orderId) {
    try {
      const order = await Order.findOne({ orderId });
      if (!order) return { success: false, message: "Order not found" };
      if (!["delivering", "delivered"].includes(order.status)) {
        return { success: false, message: "Order cannot be returned in current status" };
      }

      // Return GHN order
      if (order.ghnOrderCode) {
        try {
          const { data } = await axios.post(
            `${ghnApiUrl}/v2/switch-status/return`,
            { order_codes: [order.ghnOrderCode] },
            { headers: getGhnHeaders(true) }
          );
          if (data.code !== 200 || !data.data) throw new Error("Failed to return shipping order with GHN");
        } catch (error) {
          return { success: false, message: `GHN order return failed: ${error.message}` };
        }
      }

      // Hoàn tồn kho và cập nhật discount
      for (const item of order.items) {
        await productService.updateStock(item.product, item.quantity, "increase");
      }
      if (order.discountCode && order.discountAmount > 0) {
        await Discount.findOneAndUpdate({ code: order.discountCode }, { $inc: { usedCount: -1 } });
      }

      order.status = "return";
      await order.save();
      return { success: true, data: order, message: "Order returned successfully" };
    } catch (error) {
      return { success: false, message: `Error returning order: ${error.message}` };
    }
  },

  // Cập nhật COD amount
  updateOrderCOD: async function (orderId, codAmount) {
    if (typeof codAmount !== "number" || codAmount < 0) {
      return { success: false, message: "Invalid COD amount: must be a non-negative number" };
    }

    try {
      const order = await Order.findOne({ orderId });
      if (!order) return { success: false, message: "Order not found" };
      if (!["ready_to_pick", "picking"].includes(order.status)) {
        return { success: false, message: "Order cannot be updated in current status" };
      }

      // Update GHN COD amount
      if (order.ghnOrderCode) {
        try {
          const { data } = await axios.post(
            `${ghnApiUrl}/v2/shipping-order/updateCOD`,
            { order_code: order.ghnOrderCode, cod_amount: codAmount },
            { headers: getGhnHeaders() }
          );
          if (data.code !== 200 || !data.data) throw new Error("Failed to update COD amount with GHN");
        } catch (error) {
          return { success: false, message: `GHN COD update failed: ${error.message}` };
        }
      }

      // Update local order
      order.totalAmount = order.totalAmount - order.shippingFee + codAmount + order.discountAmount;
      await order.save();
      return {
        success: true,
        data: { orderId: order.orderId, totalAmount: order.totalAmount, codAmount },
        message: "COD amount updated successfully",
      };
    } catch (error) {
      return { success: false, message: `Error updating COD amount: ${error.message}` };
    }
  },

  // Áp dụng mã giảm giá
  applyDiscount: async function (discountCode, orderAmount) {
    try {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!discount) return { success: false, message: "Invalid or expired discount code" };
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        return { success: false, message: "Discount usage limit exceeded" };
      }
      if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
        return { success: false, message: `Minimum order amount of ${discount.minOrderAmount} required` };
      }

      let discountAmount = (orderAmount * discount.percentage) / 100;
      if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
        discountAmount = discount.maxDiscountAmount;
      }

      return { success: true, discountAmount, discountPercentage: discount.percentage };
    } catch (error) {
      return { success: false, message: `Error applying discount: ${error.message}` };
    }
  },
};

module.exports = OrderService;