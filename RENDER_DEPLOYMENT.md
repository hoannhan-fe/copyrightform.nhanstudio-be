# 🚀 Render Deployment Guide - Backend

## Prerequisites

1. MongoDB Atlas cluster đã được tạo
2. GitHub repository chứa code backend
3. Render account (sign up tại https://render.com)

## Bước 1: Chuẩn bị MongoDB Atlas

### Whitelist IP cho Render

**QUAN TRỌNG:** Phải làm bước này trước khi deploy!

1. Đăng nhập [MongoDB Atlas](https://cloud.mongodb.com/)
2. Vào **Security** → **Network Access**
3. Click **"Add IP Address"**
4. Chọn **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Click **"Confirm"**
6. Đợi 1-2 phút để changes propagate

📖 Xem chi tiết trong [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

## Bước 2: Tạo Web Service trên Render

1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Kết nối GitHub repository
4. Chọn repository chứa code backend

## Bước 3: Cấu hình Service

### Basic Settings:
- **Name:** `react-portfolio-backend` (hoặc tên bạn muốn)
- **Environment:** `Node`
- **Region:** Chọn region gần nhất
- **Branch:** `main` (hoặc branch bạn muốn)

### Build & Deploy:
- **Root Directory:** `BE` (nếu repo chứa cả FE và BE) hoặc để trống
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

### Environment Variables:
Thêm các biến sau trong tab **Environment**:

```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=AppName
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Lưu ý:**
- Thay `username`, `password`, `cluster`, `database` bằng thông tin thực tế
- Nếu password có ký tự đặc biệt, cần URL-encode
- `FRONTEND_URL` là URL của frontend đã deploy trên Render

## Bước 4: Deploy

1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Clone code từ GitHub
   - Install dependencies
   - Start server
3. Đợi deployment hoàn tất (thường 2-5 phút)

## Bước 5: Kiểm tra

### Kiểm tra Logs:
1. Vào service → tab **"Logs"**
2. Tìm dòng: `✅ Connected to MongoDB`
3. Tìm dòng: `🚀 Server is running on http://localhost:3000`

### Kiểm tra API:
1. Lấy URL của service (ví dụ: `https://react-portfolio-backend.onrender.com`)
2. Truy cập: `https://your-backend-url.onrender.com/api`
3. Bạn sẽ thấy API overview

### Test Endpoints:
```bash
# Test root endpoint
curl https://your-backend-url.onrender.com/api

# Test health check (nếu có)
curl https://your-backend-url.onrender.com/api/health
```

## Troubleshooting

### Lỗi: "Could not connect to any servers"

**Nguyên nhân:** IP chưa được whitelist trong MongoDB Atlas

**Giải pháp:**
1. Vào MongoDB Atlas → Network Access
2. Thêm `0.0.0.0/0` (Allow from anywhere)
3. Đợi 1-2 phút
4. Restart service trên Render

### Lỗi: "authentication failed"

**Nguyên nhân:** Username/password sai hoặc chưa URL-encode

**Giải pháp:**
1. Kiểm tra `MONGODB_URI` trong Environment Variables
2. Đảm bảo password đã được URL-encode nếu có ký tự đặc biệt
3. Kiểm tra user có tồn tại trong MongoDB Atlas

### Lỗi: "Cannot find module"

**Nguyên nhân:** Dependencies chưa được install

**Giải pháp:**
1. Kiểm tra `package.json` có đầy đủ dependencies
2. Đảm bảo Build Command là `npm install`
3. Clear build cache và deploy lại

### Service không start

**Kiểm tra:**
1. Start Command có đúng không? (`node server.js`)
2. File `server.js` có tồn tại không?
3. PORT có được set trong Environment Variables không?

## Cập nhật CORS

Sau khi deploy frontend, cập nhật `FRONTEND_URL` trong backend:

1. Vào Render Dashboard → Backend Service
2. Tab **Environment**
3. Cập nhật `FRONTEND_URL` = URL frontend của bạn
4. Restart service

Hoặc trong code, đảm bảo CORS cho phép frontend URL:

```javascript
// server.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);
```

## Free Tier Notes

- Service sẽ "sleep" sau 15 phút không có traffic
- Request đầu tiên sau khi sleep có thể mất 30-60 giây
- Có giới hạn về số lượng services và build time

## Next Steps

Sau khi backend deploy thành công:

1. ✅ Update `VITE_API_BASE_URL` trong frontend Environment Variables
2. ✅ Deploy frontend lên Render
3. ✅ Test toàn bộ flow: register, login, CRUD projects
4. ✅ Kiểm tra CORS hoạt động đúng

## Quick Reference

**Build Command:** `npm install`
**Start Command:** `node server.js`
**Required Env Vars:**
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`

**MongoDB Atlas Network Access:** https://cloud.mongodb.com/v2#/security/network/list

