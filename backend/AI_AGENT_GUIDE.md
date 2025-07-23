# 🤖 AI AGENT INTEGRATION GUIDE

## 📋 Tổng quan tích hợp AI Agent

### 🎯 **CHỨC NĂNG CHÍNH**

1. **Intent Detection** - Hiểu ý định khách hàng
2. **Product Recommendation** - Gợi ý sản phẩm phù hợp
3. **Order Processing** - Xử lý đặt hàng tự động
4. **Customer Support** - Hỗ trợ khách hàng 24/7
5. **Promotion Management** - Quản lý khuyến mãi

### 🔧 **CÁC COMPONENT ĐÃ TÍCH HỢP**

#### 1. **Zalo OA Integration**

- ✅ `ZaloController` - Xử lý webhook
- ✅ `ZaloService` - API client cho Zalo OA
- ✅ `ZaloRouter` - Routes cho Zalo endpoints

#### 2. **AI Service**

- ✅ `AIService` - Core AI logic
- ✅ Intent detection (rule-based)
- ✅ Context management
- ✅ Response generation

#### 3. **Session Management**

- ✅ User session tracking
- ✅ Conversation history
- ✅ Context persistence

### 🚀 **SETUP VÀ DEPLOYMENT**

#### 1. **Cài đặt dependencies mới:**

```bash
npm install axios jsonwebtoken crypto
```

#### 2. **Cấu hình Zalo OA:**

1. Đăng ký Zalo Official Account
2. Lấy Access Token và Secret Key
3. Cập nhật file `.env`:

```env
ZALO_OA_ACCESS_TOKEN=your_token_here
ZALO_OA_SECRET_KEY=your_secret_here
ZALO_APP_ID=your_app_id_here
```

#### 3. **Cấu hình Webhook:**

- URL: `https://your-domain.com/api/zalo/webhook`
- Method: POST
- Verify signature: Enabled

### 📱 **LUỒNG HOẠT ĐỘNG**

```
User gửi tin nhắn Zalo OA
     ↓
Zalo gửi webhook đến backend
     ↓
ZaloController.handleWebhook()
     ↓
AIService.processMessage()
     ↓
Intent Detection + Entity Extraction
     ↓
Route to specific handler:
- handleProductInquiry()
- handleOrderCreation()
- handlePromotionCheck()
- etc.
     ↓
Call appropriate service:
- ProductService
- OrderService
- DiscountService
- ShippingService
     ↓
Generate AI response
     ↓
ZaloService.sendMessage()
     ↓
Response gửi về Zalo OA
     ↓
User nhận tin nhắn
```

### 🎯 **INTENT PATTERNS**

#### **Greeting Intent:**

- "xin chào", "hello", "hi"
- Response: Giới thiệu AI + menu chức năng

#### **Product Inquiry Intent:**

- "sản phẩm", "coca", "nước ngọt"
- Response: Danh sách sản phẩm + giá

#### **Stock Check Intent:**

- "còn hàng", "tồn kho", "có không"
- Response: Thông tin tồn kho cụ thể

#### **Order Creation Intent:**

- "đặt hàng", "mua", "order"
- Response: Form đặt hàng + thanh toán

#### **Promotion Check Intent:**

- "khuyến mãi", "giảm giá", "ưu đãi"
- Response: Danh sách mã giảm giá

### 📊 **ENTITY EXTRACTION**

#### **Product Entities:**

- Product type: "original", "zero", "cherry"
- Size: "330ml", "500ml", "250ml"
- Quantity: numbers (1, 2, 3...)

#### **Location Entities:**

- Address extraction for delivery
- City/District detection

### 🔀 **CONVERSATION FLOW EXAMPLES**

#### **Flow 1: Mua sản phẩm**

```
User: "Chào bạn"
AI: "Xin chào! Tôi có thể giúp gì? [Menu options]"

User: "Tôi muốn mua coca"
AI: "Danh sách sản phẩm Coca-Cola [Product list]"

User: "Mua 2 chai Original 330ml"
AI: "Vui lòng cung cấp địa chỉ giao hàng"

User: "123 ABC Street HCM"
AI: "Đơn hàng đã tạo! Mã: ORDER_xxx"
```

#### **Flow 2: Kiểm tra khuyến mãi**

```
User: "Có khuyến mãi gì không?"
AI: "Khuyến mãi hiện tại: [Promotion list]"

User: "Mã COCACOLA10 áp dụng như thế nào?"
AI: "Mã COCACOLA10: Giảm 10%, đơn tối thiểu 50k"
```

### 🔧 **ADVANCED FEATURES CẦN BỔ SUNG**

#### 1. **Machine Learning Intent Detection:**

- Thay thế rule-based bằng ML model
- Training với conversation data
- Continuous learning

#### 2. **NLP Enhancement:**

- Sentiment analysis
- Named Entity Recognition (NER)
- Language understanding

#### 3. **Personalization:**

- User preference learning
- Purchase history analysis
- Recommendation engine

#### 4. **Multi-turn Conversation:**

- Complex dialog management
- State tracking
- Context switching

### 🧪 **TESTING**

#### 1. **Test AI Service:**

```bash
curl -X POST http://localhost:5000/api/zalo/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "message": "Xin chào"
  }'
```

#### 2. **Test Webhook:**

```bash
curl -X POST http://localhost:5000/api/zalo/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "user_send_text",
    "user_id_by_app": "test_user_123",
    "data": {
      "content": "Tôi muốn mua coca"
    }
  }'
```

### 📈 **MONITORING & ANALYTICS**

#### **Metrics cần track:**

- Conversation completion rate
- Intent recognition accuracy
- Order conversion rate
- Response time
- User satisfaction

#### **Logging:**

- All user interactions
- Intent detection results
- API call performance
- Error tracking

### 🚀 **DEPLOYMENT CHECKLIST**

- ✅ Zalo OA configured
- ✅ Webhook URL set up
- ✅ Environment variables configured
- ✅ Database connected
- ✅ AI Service tested
- ✅ Error handling implemented
- ✅ Logging enabled
- ✅ Monitoring set up

### 🔗 **API ENDPOINTS**

#### **Zalo Integration:**

- `POST /api/zalo/webhook` - Nhận webhook từ Zalo
- `POST /api/zalo/send-message` - Test gửi tin nhắn

#### **Existing API (tích hợp với AI):**

- `GET /api/inventory/check/:productId` - AI check stock
- `POST /api/orders/create` - AI create order
- `GET /api/promotions/active` - AI get promotions
- `GET /api/shipping/info/:orderId` - AI check shipping

**🎉 AI Agent đã sẵn sàng tích hợp với Zalo OA!**
