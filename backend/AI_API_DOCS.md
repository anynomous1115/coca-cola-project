# 🤖 API DOCUMENTATION FOR EXTERNAL AI AGENT

## 📋 Tổng quan

Backend này cung cấp REST API cho AI Agent external để tương tác với hệ thống bán hàng Coca-Cola.

**Base URL:** `http://localhost:5000/api/ai`

## 🛒 **API ENDPOINTS CHO AI AGENT**

### **1. 🥤 Lấy danh sách sản phẩm**

```http
GET /api/ai/products?category=&search=&limit=10
```

**Query Parameters:**

- `category` (optional): Filter theo category ID
- `search` (optional): Tìm kiếm theo tên sản phẩm
- `limit` (optional): Số lượng sản phẩm trả về (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "64f1234567890abc12345678",
        "name": "Coca-Cola Original 330ml",
        "description": "Nước ngọt Coca-Cola nguyên bản",
        "price": 12000,
        "stock": 150,
        "category": "64f1234567890abc12345001",
        "image": "/images/coca-original-330ml.jpg",
        "available": true
      }
    ],
    "total": 10
  },
  "message": "Products retrieved for AI",
  "code": 200
}
```

### **2. 📦 Kiểm tra tồn kho**

```http
POST /api/ai/check-stock
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "64f1234567890abc12345678",
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "productId": "64f1234567890abc12345678",
    "productName": "Coca-Cola Original 330ml",
    "available": true,
    "currentStock": 150,
    "requestedQuantity": 2,
    "canFulfill": 2
  },
  "message": "Stock checked for AI",
  "code": 200
}
```

### **3. 🛒 Tạo đơn hàng**

```http
POST /api/ai/create-order
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "64f1234567890abc12345abc",
  "items": [
    {
      "productId": "64f1234567890abc12345678",
      "quantity": 2
    }
  ],
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 ABC Street, HCM"
  },
  "discountCode": "COCACOLA10"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1690123456789",
    "totalAmount": 21600,
    "discountAmount": 2400,
    "status": "pending",
    "message": "Order created successfully"
  },
  "message": "Order created for AI",
  "code": 200
}
```

### **4. 🎁 Lấy khuyến mãi hiện hành**

```http
GET /api/ai/promotions?userId=64f1234567890abc12345abc
```

**Response:**

```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "code": "COCACOLA10",
        "name": "Giảm 10% cho tất cả sản phẩm",
        "percentage": 10,
        "maxDiscount": 20000,
        "minOrder": 50000,
        "usageLeft": 185,
        "endDate": "2025-12-31T23:59:59.000Z"
      }
    ],
    "count": 1
  },
  "message": "Promotions retrieved for AI",
  "code": 200
}
```

### **5. 📋 Kiểm tra trạng thái đơn hàng**

```http
GET /api/ai/order-status/ORDER_1690123456789
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1690123456789",
    "status": "shipping",
    "totalAmount": 21600,
    "customerInfo": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 ABC Street, HCM"
    },
    "items": [
      {
        "productName": "Coca-Cola Original 330ml",
        "quantity": 2,
        "price": 12000,
        "total": 24000
      }
    ],
    "shipping": {
      "trackingNumber": "SHIP456789",
      "estimatedDelivery": "2025-07-25T10:00:00Z",
      "shippingStatus": "in_transit"
    },
    "createdAt": "2025-07-23T10:00:00Z"
  },
  "message": "Order status retrieved for AI",
  "code": 200
}
```

### **6. ✅ Validate mã giảm giá**

```http
POST /api/ai/validate-discount
Content-Type: application/json
```

**Request Body:**

```json
{
  "discountCode": "COCACOLA10",
  "orderAmount": 100000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "code": "COCACOLA10",
    "name": "Giảm 10% cho tất cả sản phẩm",
    "percentage": 10,
    "discountAmount": 10000,
    "maxDiscount": 20000,
    "minOrder": 50000
  },
  "message": "Discount validated for AI",
  "code": 200
}
```

## 🧪 **TESTING API**

### **Test với cURL:**

**1. Lấy sản phẩm:**

```bash
curl "http://localhost:5000/api/ai/products?limit=5"
```

**2. Kiểm tra tồn kho:**

```bash
curl -X POST "http://localhost:5000/api/ai/check-stock" \
  -H "Content-Type: application/json" \
  -d '{"productId": "64f1234567890abc12345678", "quantity": 2}'
```

**3. Tạo đơn hàng:**

```bash
curl -X POST "http://localhost:5000/api/ai/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "64f1234567890abc12345abc",
    "items": [{"productId": "64f1234567890abc12345678", "quantity": 2}],
    "customerInfo": {"name": "Test User", "phone": "0901234567", "address": "Test Address"}
  }'
```

**4. Lấy khuyến mãi:**

```bash
curl "http://localhost:5000/api/ai/promotions"
```

## 📊 **ERROR HANDLING**

Tất cả API đều trả về format chuẩn:

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "code": 200
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error message",
  "code": 400|404|500
}
```

## 🔧 **INTEGRATION GUIDE**

### **Trong AI Agent của bạn:**

```javascript
// Example integration
const API_BASE = "http://localhost:5000/api/ai";

// Lấy sản phẩm
async function getProducts(search = "") {
  const response = await fetch(`${API_BASE}/products?search=${search}&limit=5`);
  const data = await response.json();
  return data.success ? data.data.products : [];
}

// Tạo đơn hàng
async function createOrder(orderData) {
  const response = await fetch(`${API_BASE}/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const data = await response.json();
  return data;
}
```

## 🚀 **DEPLOYMENT**

1. Start backend server: `npm start`
2. Server chạy trên: `http://localhost:5000`
3. AI Agent có thể gọi API từ: `http://localhost:5000/api/ai/*`

**🎉 Backend sẵn sàng cho AI Agent external kết nối!**
