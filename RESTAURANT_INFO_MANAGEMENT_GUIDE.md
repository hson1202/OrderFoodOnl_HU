# 🏪 Restaurant Information Management System

## Tổng Quan

Hệ thống quản lý thông tin nhà hàng cho phép bạn thay đổi tất cả thông tin liên hệ, giờ mở cửa, mạng xã hội và các thông tin khác từ Admin Panel thay vì phải hardcode trong code.

## ✨ Tính Năng

### 1. **Thông Tin Cơ Bản**
- Tên nhà hàng
- Số điện thoại
- Email
- Địa chỉ
- Google Maps Embed URL
- Copyright text

### 2. **Giờ Mở Cửa**
- Giờ mở cửa ngày thường (Thứ 2 - Thứ 7)
- Giờ mở cửa Chủ nhật

### 3. **Mạng Xã Hội**
- Facebook
- Instagram
- Twitter
- LinkedIn

### 4. **Đa Ngôn Ngữ (Multilingual)**
- Tiếng Việt (Vietnamese)
- English
- Magyar (Hungarian)

## 🚀 Cách Sử Dụng

### Bước 1: Truy cập Admin Panel

1. Đăng nhập vào Admin Panel
2. Nhấp vào **"Restaurant Info"** trong sidebar

### Bước 2: Cập Nhật Thông Tin

#### Tab "Thông Tin Cơ Bản"
- **Tên Nhà Hàng**: Tên hiển thị trên website
- **Số Điện Thoại**: Số điện thoại liên hệ (VD: +421 123 456 789)
- **Email**: Email liên hệ
- **Địa Chỉ**: Địa chỉ đầy đủ của nhà hàng
- **Google Maps Embed URL**: 
  1. Truy cập Google Maps
  2. Tìm địa chỉ nhà hàng của bạn
  3. Nhấp "Share" → "Embed a map"
  4. Copy URL và paste vào đây
- **Copyright Text**: Text hiển thị ở footer (VD: © 2024 Viet Bowls. All rights reserved.)

#### Tab "Giờ Mở Cửa"
- **Thứ 2 - Thứ 7**: Giờ mở cửa ngày thường (VD: 11:00 - 20:00)
- **Chủ Nhật**: Giờ mở cửa ngày Chủ nhật (VD: 11:00 - 17:00)

#### Tab "Mạng Xã Hội"
- Nhập URL đầy đủ cho từng mạng xã hội
- VD: https://facebook.com/yourpage
- Để trống nếu không sử dụng

#### Tab "Dịch Thuật"
- Cập nhật thông tin cho từng ngôn ngữ
- Bao gồm: Tên nhà hàng, Địa chỉ, Giờ mở cửa

### Bước 3: Lưu Thay Đổi

1. Nhấp nút **"💾 Lưu Thay Đổi"**
2. Thông tin sẽ được cập nhật trên toàn bộ website ngay lập tức

### Reset về Mặc Định

Nếu muốn reset tất cả thông tin về giá trị mặc định:
1. Nhấp nút **"↺ Reset"** ở góc trên bên phải
2. Xác nhận reset
3. Tất cả thông tin sẽ trở về giá trị mặc định

## 📍 Nơi Thông Tin Được Hiển Thị

Thông tin nhà hàng sẽ tự động hiển thị ở:

1. **Footer** (Tất cả các trang)
   - Phone, Email, Address
   - Social media links
   - Copyright text

2. **Contact Us Page**
   - Contact information
   - Opening hours
   - Google Maps
   - Address details

3. **Home Page**
   - Google Maps section

## 🔧 Technical Details

### Backend API Endpoints

```
GET    /api/restaurant-info          # Lấy thông tin (Public)
PUT    /api/restaurant-info          # Cập nhật (Admin only)
POST   /api/restaurant-info/reset    # Reset về mặc định (Admin only)
```

### Database Model

- **Collection**: `restaurantinfos`
- **Schema**: Xem file `models/restaurantInfoModel.js`

### Frontend Hook

```javascript
import useRestaurantInfo from '../../hooks/useRestaurantInfo'

const { restaurantInfo, loading, error } = useRestaurantInfo()
```

## 🎨 Ví Dụ Sử Dụng

### Thay Đổi Số Điện Thoại

1. Vào Admin Panel → Restaurant Info
2. Tab "Thông Tin Cơ Bản"
3. Thay đổi "Số Điện Thoại": `+421 952 514 268`
4. Lưu thay đổi
5. ✅ Số điện thoại mới sẽ hiển thị ở Footer và Contact page

### Cập Nhật Google Maps

1. Vào Google Maps
2. Tìm địa chỉ: "1051 Budapest, Hungary" (hoặc địa chỉ thực tế của nhà hàng)
3. Share → Embed a map → Copy iframe src URL
4. Paste vào Admin Panel → Restaurant Info → Google Maps Embed URL
5. Lưu thay đổi
6. ✅ Map mới hiển thị trên website

### Thêm Instagram Link

1. Vào Admin Panel → Restaurant Info
2. Tab "Mạng Xã Hội"
3. Instagram: `https://instagram.com/vietbowls`
4. Lưu thay đổi
5. ✅ Instagram icon sẽ xuất hiện trong Footer

## 🌍 Multilingual Support

Hệ thống hỗ trợ 3 ngôn ngữ:
- 🇻🇳 Tiếng Việt
- 🇬🇧 English
- 🇭🇺 Magyar

Mỗi ngôn ngữ có thể có:
- Tên nhà hàng riêng
- Địa chỉ riêng (nếu cần format khác)
- Giờ mở cửa riêng (format khác nhau theo ngôn ngữ)

## 🔐 Security

- **Public endpoints**: Chỉ GET thông tin
- **Admin endpoints**: Yêu cầu authentication token
- Tất cả update phải được thực hiện qua Admin Panel

## 📝 Notes

- Thông tin được cache trong frontend để tối ưu performance
- Mỗi lần cập nhật, frontend sẽ tự động refresh
- Nếu API lỗi, hệ thống sẽ fallback về giá trị mặc định
- Chỉ có 1 document trong database (singleton pattern)

## 🐛 Troubleshooting

### Thông tin không cập nhật trên website
1. Kiểm tra Admin Panel có hiển thị thông báo success không
2. Hard refresh browser (Ctrl + F5)
3. Check console log xem có lỗi API không

### Google Maps không hiển thị
1. Đảm bảo bạn copy đúng "iframe src" URL
2. URL phải bắt đầu với: `https://www.google.com/maps/embed?pb=...`
3. Không copy toàn bộ iframe tag, chỉ copy URL trong src

### Social media icons không hiển thị
1. Đảm bảo URL bắt đầu với `https://`
2. URL phải là full URL (VD: https://facebook.com/page)
3. Lưu thay đổi và refresh browser

## 🎉 Lợi Ích

✅ **Dễ dàng cập nhật**: Không cần code, chỉ cần vào Admin Panel
✅ **Realtime**: Thay đổi ngay lập tức trên website
✅ **Đa ngôn ngữ**: Hỗ trợ nhiều ngôn ngữ
✅ **Tập trung**: Tất cả thông tin ở một nơi
✅ **An toàn**: Chỉ admin mới có quyền thay đổi
✅ **Linh hoạt**: Có thể reset về mặc định bất cứ lúc nào

---

**Tác giả**: AI Assistant  
**Ngày tạo**: January 2026  
**Version**: 1.0.0
