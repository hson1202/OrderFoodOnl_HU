# 🚚 Mapbox Delivery Distance & Fee Calculation

## ✨ Features Implemented

### Frontend (User):
- ✅ **Mapbox Autocomplete** - Tự động hoàn thành địa chỉ khi khách nhập
- ✅ **Real-time Delivery Fee Calculation** - Tính phí ship tự động theo khoảng cách
- ✅ **Distance Display** - Hiển thị khoảng cách từ nhà hàng đến khách
- ✅ **Estimated Delivery Time** - Thời gian giao hàng dự kiến
- ✅ **Minimum Order Validation** - Kiểm tra đơn hàng tối thiểu theo zone
- ✅ **Delivery Zones Display** - Hiển thị tất cả zones có sẵn

### Admin Panel:
- ✅ **CRUD Delivery Zones** - Tạo, sửa, xóa delivery zones
- ✅ **Restaurant Location Management** - Quản lý vị trí nhà hàng
- ✅ **Zone Configuration** - Cấu hình distance, fee, minimum order, time
- ✅ **Visual Zone Cards** - Giao diện đẹp, dễ quản lý

### Backend:
- ✅ **Mapbox Geocoding API Integration** - Chuyển địa chỉ thành tọa độ
- ✅ **Haversine Distance Calculation** - Tính khoảng cách chính xác
- ✅ **Delivery Zone Matching** - Tìm zone phù hợp với khoảng cách
- ✅ **RESTful API Endpoints** - API đầy đủ cho frontend & admin

---

## 🚀 Setup Guide

### Step 1: Get Mapbox Access Token (FREE)

1. Đăng ký tài khoản miễn phí tại: https://account.mapbox.com/auth/signup
2. Sau khi đăng nhập, vào: https://account.mapbox.com/access-tokens
3. Copy **Default public token** hoặc tạo token mới
4. **FREE Tier**: 100,000 requests/tháng (đủ cho hầu hết nhà hàng!)

### Step 2: Configure Backend

1. **Thêm Mapbox token vào `.env`:**

```env
# Backend/.env
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHh4In0.xxxxxxxxxxxx
```

2. **Seed default delivery zones và restaurant location:**

```bash
cd Backend
node scripts/seedDeliveryZones.js
```

Sẽ tạo 4 zones mặc định:
- 1-3 km: FREE, Min order €8, 25 min
- 3-5 km: €2, Min order €9, 30 min
- 5-7 km: €3, Min order €10, 40 min
- 7-12 km: €3.5, Min order €10, 45 min

3. **Restart backend server:**

```bash
npm run dev
# hoặc
npm start
```

### Step 3: Configure Restaurant Location

1. Vào **Admin Panel** → **Delivery Zones**
2. Click **"Edit Location"**
3. Nhập thông tin nhà hàng:
   - **Name**: Tên nhà hàng
   - **Address**: Địa chỉ đầy đủ
   - **Latitude & Longitude**: Tọa độ chính xác

**Cách lấy tọa độ:**
- Vào Google Maps → Chuột phải vào vị trí nhà hàng → Click tọa độ để copy
- Ví dụ: `47.4979, 19.0402` (Budapest)

4. Click **"Save Location"**

### Step 4: Customize Delivery Zones (Optional)

Trong Admin Panel → Delivery Zones:

**Add new zone:**
1. Click **"+ Add Zone"**
2. Điền thông tin:
   - Zone Name: "5-10 Km"
   - Min Distance: 5
   - Max Distance: 10
   - Delivery Fee: 4 (€)
   - Min Order: 12 (€)
   - Estimated Time: 50 (phút)
   - Color: Chọn màu để phân biệt
3. Click **"Create Zone"**

**Edit existing zone:**
- Click ✏️ icon trên zone card
- Sửa thông tin cần thiết
- Click **"Update Zone"**

**Delete zone:**
- Click 🗑️ icon trên zone card
- Confirm deletion

---

## 📱 How It Works (User Flow)

### Checkout Page (`/order`):

1. **Khách nhập địa chỉ giao hàng:**
   - Gõ địa chỉ → Mapbox hiện gợi ý
   - Click chọn địa chỉ từ dropdown

2. **Hệ thống tự động:**
   - ✅ Chuyển địa chỉ thành tọa độ (Geocoding)
   - ✅ Tính khoảng cách từ nhà hàng → khách (Haversine)
   - ✅ Tìm delivery zone phù hợp
   - ✅ Hiển thị phí ship, minimum order, thời gian dự kiến

3. **Validation khi đặt hàng:**
   - Nếu tổng tiền < minimum order → Báo lỗi
   - Nếu địa chỉ ngoài phạm vi giao hàng → Báo lỗi

### Example Flow:

```
User nhập: "123 Main Street, Budapest"
        ↓
Mapbox Geocoding: { lat: 47.5000, lng: 19.0500 }
        ↓
Haversine Calculation: Distance = 2.5 km
        ↓
Zone Matching: "1-3 Km" zone
        ↓
Display:
  🚚 1-3 Km • 2.5km • 25min
  Delivery Fee: FREE
  Min. Order: €8.00
```

---

## 🔧 API Endpoints

### Public Endpoints (No auth required):

```bash
# Get all delivery zones
GET /api/delivery/zones

# Calculate delivery fee from address
POST /api/delivery/calculate
Body: {
  "address": "123 Main St, Budapest",
  "latitude": 47.5000,  // optional if address provided
  "longitude": 19.0500  // optional if address provided
}

# Autocomplete address
GET /api/delivery/autocomplete?query=budapest&proximity=19.0402,47.4979

# Get restaurant location
GET /api/delivery/restaurant-location
```

### Admin Endpoints (Auth required):

```bash
# Create delivery zone
POST /api/delivery/zones/create
Headers: { token: "admin-token" }
Body: {
  "name": "1-3 Km",
  "minDistance": 1,
  "maxDistance": 3,
  "deliveryFee": 0,
  "minOrder": 8,
  "estimatedTime": 25,
  "color": "#3B82F6"
}

# Update delivery zone
PUT /api/delivery/zones/:id
Headers: { token: "admin-token" }

# Delete delivery zone
DELETE /api/delivery/zones/:id
Headers: { token: "admin-token" }

# Update restaurant location
PUT /api/delivery/restaurant-location
Headers: { token: "admin-token" }
Body: {
  "name": "VietBowls Restaurant",
  "address": "Budapest, Hungary",
  "latitude": 47.4979,
  "longitude": 19.0402
}
```

---

## 💡 Technical Details

### Haversine Formula

Tính khoảng cách thẳng giữa 2 điểm trên trái đất:

```javascript
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
```

**Accuracy:** ~95-98% so với đường đi thực tế (đủ chính xác cho delivery)

### Why FREE?

- **Geocoding**: Mapbox (FREE 100k requests/month)
- **Distance Calculation**: Haversine (chạy trên server, FREE)
- **No external routing API needed**

---

## 🎨 Customization

### Change Default Zones Colors:

```javascript
// Admin/src/pages/DeliveryZones/DeliveryZones.jsx
const zoneForm = {
  color: '#FF6347', // Tomato red
  // hoặc
  color: '#10B981', // Green
  // hoặc
  color: '#8B5CF6', // Purple
}
```

### Add More Zone Properties:

1. **Backend Model** (`Backend/models/deliveryZoneModel.js`):
```javascript
description: {
  type: String,
  default: ""
},
isPopular: {
  type: Boolean,
  default: false
}
```

2. **Frontend Form** (Admin + Frontend components)

---

## 🐛 Troubleshooting

### Mapbox API Not Working:

```bash
# Check backend logs:
# Error: "Mapbox access token not configured"
```

**Solution:**
- Kiểm tra `MAPBOX_ACCESS_TOKEN` trong `.env`
- Restart backend server
- Test: `curl https://api.mapbox.com/geocoding/v5/mapbox.places/bratislava.json?access_token=YOUR_TOKEN`

### Restaurant Location Not Set:

**Solution:**
- Vào Admin Panel → Delivery Zones
- Click "Set Location"
- Nhập đầy đủ thông tin và tọa độ

### Distance Always Shows 0:

**Solution:**
- Kiểm tra restaurant location có tọa độ chưa
- Kiểm tra latitude/longitude format (number, không phải string)

### Zone Not Matching:

**Solution:**
- Kiểm tra min/max distance của zones
- Đảm bảo không có gap giữa zones (ví dụ: 1-3, 3-5, 5-7...)

---

## 📊 Performance

- **Geocoding API call**: ~100-200ms
- **Haversine calculation**: <1ms (instant)
- **Zone matching**: <1ms
- **Total**: ~100-200ms per address

**Optimization:**
- Frontend cache results (same address = no API call)
- Backend có thể cache popular addresses

---

## 🔐 Security

- ✅ Admin endpoints protected by auth middleware
- ✅ Input validation on all endpoints
- ✅ Rate limiting recommended for production
- ✅ MAPBOX_ACCESS_TOKEN stored in environment variables (not in code)

---

## 📝 Notes

1. **Mapbox FREE tier:** 100,000 requests/month
   - ~3,300 requests/day
   - Đủ cho ~500-1000 orders/day (với caching)

2. **Distance accuracy:**
   - Haversine: Khoảng cách thẳng
   - Production: Có thể dùng Mapbox Directions API nếu cần đường đi thực

3. **Scalability:**
   - Có thể thêm multiple restaurant locations
   - Có thể thêm zone-specific delivery times (peak hours)
   - Có thể integrate với delivery tracking

---

## 🎉 Features to Add (Future)

- [ ] Real-time delivery tracking
- [ ] Multiple restaurant locations support
- [ ] Peak hours surcharge
- [ ] Free delivery promotions by zone
- [ ] Delivery heatmap visualization
- [ ] Customer delivery history & preferred addresses

---

## 📞 Support

Issues? Contact: admin@vietbowls.com

**Enjoy your FREE Mapbox-powered delivery system! 🚀**

