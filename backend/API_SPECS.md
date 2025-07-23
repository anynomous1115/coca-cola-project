# 🥤 Coca-Cola AI Agent - API Documentation

## 📋 API Specs theo yêu cầu

### 1. 📦 **KIỂM TRA TỒN KHO**

#### Kiểm tra tồn kho 1 sản phẩm

```
GET /api/inventory/check/:productId?quantity=2
```

**Response:**

```json
{
  "success": true,
  "data": {
    "productId": "64f1234567890abc12345678",
    "productName": "Coca-Cola Original 330ml",
    "currentStock": 50,
    "requestedQuantity": 2,
    "isAvailable": true,
    "canFulfill": 2
  }
}
```

#### Kiểm tra tồn kho nhiều sản phẩm

```
POST /api/inventory/check-multiple
```

**Request:**

```json
{
  "items": [
    { "productId": "64f1234567890abc12345678", "quantity": 2 },
    { "productId": "64f1234567890abc12345679", "quantity": 1 }
  ]
}
```

---

### 2. 🛒 **TẠO ĐƠN HÀNG**

#### Tạo đơn hàng mới

```
POST /api/orders/create
```

**Request:**

```json
{
  "userId": "64f1234567890abc12345678",
  "items": [
    { "productId": "64f1234567890abc12345678", "quantity": 2 },
    { "productId": "64f1234567890abc12345679", "quantity": 1 }
  ],
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 ABC Street, HCM"
  },
  "discountCode": "SALE10"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1690123456789",
    "totalAmount": 35000,
    "discountAmount": 3500,
    "status": "pending"
  },
  "message": "Order created successfully"
}
```

#### Lấy thông tin đơn hàng

```
GET /api/orders/:orderId
```

#### Cập nhật trạng thái đơn hàng

```
PUT /api/orders/:orderId/status
```

**Request:**

```json
{
  "status": "confirmed"
}
```

---

### 3. 🎁 **LẤY KHUYẾN MÃI HIỆN HÀNH**

#### Lấy danh sách khuyến mãi

```
GET /api/promotions/active
```

**Response:**

```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "code": "SALE20",
        "name": "Giảm 20% tất cả sản phẩm",
        "percentage": 20,
        "maxDiscountAmount": 50000,
        "minOrderAmount": 100000
      }
    ],
    "count": 1
  }
}
```

#### Validate mã giảm giá

```
POST /api/promotions/validate
```

**Request:**

```json
{
  "discountCode": "SALE20",
  "orderAmount": 150000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "code": "SALE20",
    "name": "Giảm 20% tất cả sản phẩm",
    "percentage": 20,
    "discountAmount": 30000,
    "remainingUsage": 95
  },
  "message": "Mã giảm giá hợp lệ"
}
```

---

### 4. 🚚 **GỬI THÔNG TIN GIAO HÀNG**

#### Lấy thông tin giao hàng

```
GET /api/shipping/info/:orderId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_1690123456789",
    "status": "shipping",
    "customer": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 ABC Street, HCM"
    },
    "trackingNumber": "SHIP456789",
    "estimatedDelivery": "2025-07-25T10:00:00Z",
    "shippingStatus": "in_transit"
  }
}
```

#### Cập nhật trạng thái giao hàng

```
PUT /api/shipping/status/:orderId
```

**Request:**

```json
{
  "shippingStatus": "delivered"
}
```

#### Tính phí ship

```
POST /api/shipping/calculate-fee
```

**Request:**

```json
{
  "address": "123 ABC Street, HCM",
  "weight": 1.5
}
```

---

## 🚀 **Test Commands**

### Khởi chạy server:

```bash
cd backend
npm start
```

### Test các API:

1. **Kiểm tra tồn kho:**

```bash
curl http://localhost:5000/api/inventory/check/64f1234567890abc12345678?quantity=2
```

2. **Tạo đơn hàng:**

```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "64f1234567890abc12345678",
    "items": [{"productId": "64f1234567890abc12345678", "quantity": 2}],
    "customerInfo": {"name": "Test User", "phone": "0901234567", "address": "Test Address"}
  }'
```

3. **Lấy khuyến mãi:**

```bash
curl http://localhost:5000/api/promotions/active
```

4. **Thông tin giao hàng:**

```bash
curl http://localhost:5000/api/shipping/info/ORDER_1690123456789
```

## 📋 **Tóm tắt 4 bước chính:**

✅ **1. Kiểm tra tồn kho** - `/api/inventory/check/:productId`
✅ **2. Tạo đơn hàng** - `/api/orders/create`  
✅ **3. Lấy khuyến mãi hiện hành** - `/api/promotions/active`
✅ **4. Gửi thông tin giao hàng** - `/api/shipping/info/:orderId`

**Tất cả API đã sẵn sàng và có thể test ngay! 🎉**
