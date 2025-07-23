# Hekate Website Demo - Backend API

## 📝 Mô tả dự án

Backend API cho ứng dụng Hekate Website Demo, cung cấp các endpoint để quản lý bài viết (posts) được crawl từ Facebook. Dự án được xây dựng bằng Node.js, Express.js và MongoDB.

## 🚀 Tính năng

- ✅ API RESTful để quản lý bài viết
- ✅ Phân trang với MongoDB (skip/limit)
- ✅ Chuẩn hóa response (success/error handler)
- ✅ Clean architecture (controller/service/model)
- ✅ Import dữ liệu JSON vào MongoDB
- ✅ Index database để tối ưu truy vấn

## 🛠 Công nghệ sử dụng

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose ODM
- **Environment**: dotenv
- **CORS**: Hỗ trợ cross-origin requests
- **Dev Tools**: Nodemon

## 📁 Cấu trúc thư mục

```
backend/
├── config/
│   └── db.js                 # Kết nối MongoDB
├── controllers/
│   └── posts.controller.js   # Controller xử lý request/response
├── helper/
│   └── responseHandler.js    # Chuẩn hóa response
├── models/
│   └── posts.model.js        # Schema MongoDB
├── routes/
│   └── posts.router.js       # Định nghĩa routes
├── scripts/
│   ├── import.js             # Script import dữ liệu
│   └── posts.json            # Dữ liệu mẫu
├── services/
│   └── posts.service.js      # Business logic
├── utils/
│   └── pagination.js         # Utility phân trang
├── server.js                 # Entry point
├── package.json
└── .env                      # Environment variables
```

## 🔧 Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Tạo file `.env` trong thư mục root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/horus_demo
```

### 4. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy local hoặc cung cấp connection string remote.

### 5. Import dữ liệu mẫu (optional)

**Lưu ý**: Đảm bảo MongoDB đã được khởi động và kết nối thành công trước khi import.

```bash
# Di chuyển vào thư mục backend (nếu chưa)
cd backend

# Chạy script import
node scripts/import.js
```

Script sẽ:

- Kết nối đến MongoDB sử dụng connection string từ `.env`
- Đọc file `scripts/posts.json`
- Import tất cả dữ liệu vào collection `posts`
- Hiển thị số lượng posts đã import thành công
- Tự động thoát sau khi hoàn thành

**Kết quả mong đợi:**

```
Connected to MongoDB
Imported 589 posts.
```

### 6. Chạy ứng dụng

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Endpoints

### Get All Posts

```http
GET /api/posts?page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "totalCount": 589,
      "totalPages": 59,
      "currentPage": 1,
      "hasPrevPage": false,
      "hasNextPage": true,
      "prevPage": null,
      "nextPage": 2
    }
  },
  "message": "Posts retrieved successfully",
  "code": 200
}
```

### Get Post By ID

```http
GET /api/posts/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Sample Post",
    "caption": "Post caption",
    "images": ["url1", "url2"],
    "articleUrl": "https://example.com",
    "createdAt": "2024-01-23T00:00:00.000Z",
    "crawledAt": "2025-07-17T09:38:06.543Z"
  },
  "message": "Post retrieved successfully",
  "code": 200
}
```

## 🗄 Database Schema

### Post Model

```javascript
{
  title: String (required),          // Tiêu đề bài viết
  caption: String,                   // Caption bài viết
  images: [String],                  // Mảng URL ảnh
  articleUrl: String (required),     // Link bài viết gốc
  createdAt: Date (required),        // Ngày đăng gốc
  crawledAt: Date (default: now)     // Ngày crawl
}
```

### Indexes

- `crawledAt: 1` - Tối ưu sắp xếp theo thời gian crawl
- `title: 1` - Tối ưu tìm kiếm theo tiêu đề

## 🎯 Clean Code Practices

### 1. Separation of Concerns

- **Controllers**: Xử lý HTTP request/response
- **Services**: Business logic và database operations
- **Models**: Database schema definition
- **Utils**: Utility functions (pagination, etc.)

### 2. Error Handling

- Service throw error, Controller catch và trả response
- Chuẩn hóa error/success response
- HTTP status codes đúng chuẩn

### 3. Performance Optimization

- Database pagination với skip/limit
- Index cho các trường thường query
- Giới hạn số lượng records per page (max 100)

## 🔍 Scripts

### Import Data

```bash
node scripts/import.js
```

Import dữ liệu từ `scripts/posts.json` vào MongoDB.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Author

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Express.js community
- MongoDB/Mongoose documentation
- Node.js ecosystem
