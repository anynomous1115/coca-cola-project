const productService = require("./products.service");
const orderService = require("./orders.service");
const discountService = require("./discounts.service");
const shippingService = require("./shipping.service");

class AIService {
  constructor() {
    this.userSessions = new Map(); // Lưu context conversation
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  // Xử lý tin nhắn chính
  async processMessage({ userId, message, platform = "zalo" }) {
    try {
      // 1. Lấy context conversation
      let session = this.getUserSession(userId);

      // 2. Intent Detection
      const intent = await this.detectIntent(message, session.context);

      // 3. Xử lý theo intent
      let response;
      switch (intent.name) {
        case "greeting":
          response = await this.handleGreeting(userId, intent);
          break;
        case "product_inquiry":
          response = await this.handleProductInquiry(userId, intent);
          break;
        case "check_stock":
          response = await this.handleStockCheck(userId, intent);
          break;
        case "create_order":
          response = await this.handleOrderCreation(userId, intent);
          break;
        case "check_promotions":
          response = await this.handlePromotionCheck(userId, intent);
          break;
        case "order_status":
          response = await this.handleOrderStatus(userId, intent);
          break;
        default:
          response = await this.handleFallback(userId, message);
      }

      // 4. Cập nhật context
      this.updateUserSession(userId, {
        lastMessage: message,
        lastIntent: intent,
        lastResponse: response,
      });

      return response;
    } catch (error) {
      console.error("❌ AI Processing error:", error);
      return {
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau! 😊",
        type: "text",
      };
    }
  }

  // Intent Detection sử dụng OpenAI hoặc rule-based
  async detectIntent(message, context = {}) {
    const lowerMessage = message.toLowerCase();

    // Rule-based intent detection (có thể thay bằng ML model)
    if (
      lowerMessage.includes("xin chào") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi")
    ) {
      return { name: "greeting", confidence: 0.9 };
    }

    if (
      lowerMessage.includes("sản phẩm") ||
      lowerMessage.includes("coca") ||
      lowerMessage.includes("nước ngọt")
    ) {
      return {
        name: "product_inquiry",
        confidence: 0.8,
        entities: this.extractProductEntities(message),
      };
    }

    if (
      lowerMessage.includes("còn hàng") ||
      lowerMessage.includes("tồn kho") ||
      lowerMessage.includes("có không")
    ) {
      return { name: "check_stock", confidence: 0.8 };
    }

    if (
      lowerMessage.includes("đặt hàng") ||
      lowerMessage.includes("mua") ||
      lowerMessage.includes("order")
    ) {
      return { name: "create_order", confidence: 0.9 };
    }

    if (
      lowerMessage.includes("khuyến mãi") ||
      lowerMessage.includes("giảm giá") ||
      lowerMessage.includes("ưu đãi")
    ) {
      return { name: "check_promotions", confidence: 0.8 };
    }

    if (
      lowerMessage.includes("đơn hàng") ||
      lowerMessage.includes("trạng thái")
    ) {
      return { name: "order_status", confidence: 0.7 };
    }

    return { name: "unknown", confidence: 0.1 };
  }

  // Xử lý chào hỏi
  async handleGreeting(userId, intent) {
    const promotions = await discountService.getActivePromotions();
    const promoText =
      promotions.success && promotions.data.promotions.length > 0
        ? `\n\n🎁 Khuyến mãi hot: ${promotions.data.promotions[0].name}`
        : "";

    return {
      text: `Xin chào! 👋 Tôi là AI Assistant của Coca-Cola Việt Nam.\n\nTôi có thể giúp bạn:\n🥤 Tìm sản phẩm Coca-Cola\n📦 Kiểm tra tồn kho\n🛒 Đặt hàng nhanh\n🎁 Thông tin khuyến mãi\n🚚 Theo dõi đơn hàng${promoText}\n\nBạn cần tìm sản phẩm gì ạ? 😊`,
      type: "text",
    };
  }

  // Xử lý tìm sản phẩm
  async handleProductInquiry(userId, intent) {
    try {
      const products = await productService.getProducts({ limit: 5 });

      if (!products.success) {
        return {
          text: "Xin lỗi, hiện tại không thể tải danh sách sản phẩm. Vui lòng thử lại! 😊",
          type: "text",
        };
      }

      let response = "🥤 **SẢN PHẨM COCA-COLA HOT** 🥤\n\n";

      products.data.products.slice(0, 5).forEach((product, index) => {
        response += `${index + 1}. **${product.name}**\n`;
        response += `   💰 Giá: ${product.price.toLocaleString("vi-VN")} VND\n`;
        response += `   📦 Còn: ${product.stock} sản phẩm\n\n`;
      });

      response += "Gõ tên sản phẩm hoặc 'đặt hàng' để mua ngay! 🛒";

      return {
        text: response,
        type: "text",
      };
    } catch (error) {
      return {
        text: "Có lỗi khi tải sản phẩm. Vui lòng thử lại! 😊",
        type: "text",
      };
    }
  }

  // Xử lý kiểm tra tồn kho
  async handleStockCheck(userId, intent) {
    return {
      text: "📦 Vui lòng cho tôi biết tên sản phẩm bạn muốn kiểm tra tồn kho!\n\nVí dụ: 'Coca Original 330ml còn hàng không?'",
      type: "text",
    };
  }

  // Xử lý tạo đơn hàng
  async handleOrderCreation(userId, intent) {
    return {
      text: "🛒 **TẠO ĐƠN HÀNG NHANH**\n\nVui lòng cho tôi biết:\n1. Sản phẩm muốn mua\n2. Số lượng\n3. Địa chỉ giao hàng\n\nVí dụ: 'Mua 2 chai Coca Original 330ml giao đến 123 ABC Street HCM'",
      type: "text",
    };
  }

  // Xử lý khuyến mãi
  async handlePromotionCheck(userId, intent) {
    try {
      const promotions = await discountService.getActivePromotions();

      if (!promotions.success || promotions.data.promotions.length === 0) {
        return {
          text: "🎁 Hiện tại không có khuyến mãi đặc biệt nào. Hãy theo dõi để cập nhật ưu đãi mới nhất! 😊",
          type: "text",
        };
      }

      let response = "🎁 **KHUYẾN MÃI HOT** 🎁\n\n";

      promotions.data.promotions.forEach((promo, index) => {
        response += `${index + 1}. **${promo.name}**\n`;
        response += `   🏷️ Mã: ${promo.code}\n`;
        response += `   💯 Giảm: ${promo.percentage}%\n`;
        response += `   💰 Tối đa: ${promo.maxDiscountAmount?.toLocaleString(
          "vi-VN"
        )} VND\n`;
        response += `   📊 Đơn tối thiểu: ${promo.minOrderAmount?.toLocaleString(
          "vi-VN"
        )} VND\n\n`;
      });

      response += "Sử dụng mã khi đặt hàng để được giảm giá! 🎉";

      return {
        text: response,
        type: "text",
      };
    } catch (error) {
      return {
        text: "Có lỗi khi tải thông tin khuyến mãi. Vui lòng thử lại! 😊",
        type: "text",
      };
    }
  }

  // Xử lý trạng thái đơn hàng
  async handleOrderStatus(userId, intent) {
    return {
      text: "📋 Vui lòng cung cấp mã đơn hàng để tôi tra cứu trạng thái!\n\nVí dụ: 'ORDER_1690123456789'",
      type: "text",
    };
  }

  // Xử lý fallback
  async handleFallback(userId, message) {
    return {
      text: "😊 Tôi chưa hiểu ý bạn. Có thể bạn thử:\n\n🥤 'Xem sản phẩm'\n📦 'Kiểm tra tồn kho'\n🛒 'Đặt hàng'\n🎁 'Khuyến mãi'\n📋 'Trạng thái đơn hàng'\n\nHoặc liên hệ hotline: 1900-1234 để được hỗ trợ! 📞",
      type: "text",
    };
  }

  // Extract entities từ tin nhắn
  extractProductEntities(message) {
    const entities = [];
    const lowerMessage = message.toLowerCase();

    // Detect product types
    if (
      lowerMessage.includes("original") ||
      lowerMessage.includes("nguyên bản")
    ) {
      entities.push({ type: "product_type", value: "original" });
    }
    if (lowerMessage.includes("zero") || lowerMessage.includes("không đường")) {
      entities.push({ type: "product_type", value: "zero" });
    }
    if (lowerMessage.includes("cherry") || lowerMessage.includes("anh đào")) {
      entities.push({ type: "product_type", value: "cherry" });
    }

    // Detect sizes
    if (lowerMessage.includes("330ml") || lowerMessage.includes("330")) {
      entities.push({ type: "size", value: "330ml" });
    }
    if (lowerMessage.includes("500ml") || lowerMessage.includes("500")) {
      entities.push({ type: "size", value: "500ml" });
    }

    return entities;
  }

  // Session management
  getUserSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        context: {},
        history: [],
        createdAt: new Date(),
      });
    }
    return this.userSessions.get(userId);
  }

  updateUserSession(userId, data) {
    const session = this.getUserSession(userId);
    session.history.push({
      timestamp: new Date(),
      ...data,
    });

    // Keep only last 10 interactions
    if (session.history.length > 10) {
      session.history = session.history.slice(-10);
    }

    this.userSessions.set(userId, session);
  }

  // Xử lý hình ảnh (nếu user gửi ảnh sản phẩm)
  async processImage({ userId, imageUrl }) {
    return {
      text: "📷 Tôi đã nhận được hình ảnh của bạn! Hiện tại tôi chưa thể phân tích hình ảnh, nhưng bạn có thể mô tả sản phẩm cần tìm bằng text để tôi hỗ trợ tốt hơn! 😊",
      type: "text",
    };
  }
}

module.exports = new AIService();
