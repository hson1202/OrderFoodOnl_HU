# 🕐 Today's Special Menu Component

## 📋 Tổng Quan

Component **TodaySpecialMenu** hiển thị các món ăn có **time-based availability** (khung giờ phục vụ) một cách riêng biệt và nổi bật trên trang chủ.

## ✨ Tính Năng

### 1. **Tự Động Filter Theo Thời Gian**
- ✅ Chỉ hiển thị món đang **available** theo thời gian thực
- ✅ Tự động ẩn món **hết giờ**
- ✅ Auto-refresh mỗi **60 giây**

### 2. **Phân Loại Thông Minh**
Món ăn được tự động phân loại theo khung giờ:

| Loại | Khung Giờ | Icon |
|------|-----------|------|
| **Bữa Sáng** | 06:00 - 11:00 | 🌅 |
| **Bữa Trưa** | 11:00 - 15:00 | 🍱 |
| **Bữa Tối** | 17:00 - 22:00 | 🌙 |
| **Đặc Biệt** | Khác / Date-based | ⭐ |

### 3. **Multilingual Support**
- 🇻🇳 **Tiếng Việt** (vi)
- 🇬🇧 **English** (en)
- 🇭🇺 **Magyar** (hu)

### 4. **UI/UX Tuyệt Đẹp**
- 🎨 Gradient header với animation
- ⏰ Real-time clock hiển thị giờ hiện tại
- 📱 Fully responsive (Desktop, Tablet, Mobile)
- ✨ Smooth animations và transitions

## 🚀 Cách Sử Dụng

### Bước 1: Import Component

```jsx
import TodaySpecialMenu from '../../components/TodaySpecialMenu/TodaySpecialMenu'
```

### Bước 2: Thêm vào Page

```jsx
function Home() {
  return (
    <div>
      <Header />
      <ExploreMenu />
      
      {/* Today's Special Menu */}
      <TodaySpecialMenu />
      
      <FoodDisplay />
    </div>
  )
}
```

### Bước 3: Thêm Món Có Time-Based Availability

Sử dụng API để thêm món với time settings:

```javascript
POST /api/food/add
{
  "name": "Phở bò sáng",
  "price": 65,
  "category": "Menu Sáng",
  
  // Time-based availability
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "07:00",
  "dailyTimeTo": "10:00"
}
```

## 🎯 Logic Hoạt Động

### Filter Items

```javascript
// Chỉ lấy món có time-based availability VÀ đang available
const timeBasedFoods = food_list.filter(food => {
  const hasTimeAvailability = 
    food.availableFrom || 
    food.availableTo || 
    food.dailyAvailability?.enabled

  if (hasTimeAvailability) {
    return isFoodAvailable(food) // Check current time
  }
  
  return false
})
```

### Categorize by Time Period

```javascript
// Phân loại dựa trên dailyTimeFrom
const [hours] = timeFrom.split(':').map(Number)

if (hours >= 6 && hours < 11) {
  // Breakfast 🌅
} else if (hours >= 11 && hours < 15) {
  // Lunch 🍱
} else if (hours >= 17 && hours < 22) {
  // Dinner 🌙
} else {
  // Special ⭐
}
```

## 📊 Ví Dụ Thực Tế

### 1. Menu Breakfast (06:00 - 10:00)

```json
{
  "sku": "BF-001",
  "name": "Phở bò sáng",
  "nameVI": "Phở bò sáng",
  "nameEN": "Morning Beef Pho",
  "nameSK": "Ranné hovädzie Pho",
  "price": 65,
  "category": "Menu Sáng",
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "07:00",
  "dailyTimeTo": "10:00"
}
```

**Kết quả:** Món này sẽ hiển thị trong section **🌅 Bữa Sáng** từ 7h - 10h mỗi ngày.

### 2. Menu Lunch (11:00 - 14:30)

```json
{
  "sku": "LC-001",
  "name": "Cơm tấm trưa",
  "price": 75,
  "category": "Menu Trưa",
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "11:00",
  "dailyTimeTo": "14:30"
}
```

**Kết quả:** Món này sẽ hiển thị trong section **🍱 Bữa Trưa** từ 11h - 14h30 mỗi ngày.

### 3. Weekend Special (Date-based)

```json
{
  "sku": "WE-001",
  "name": "Buffet cuối tuần",
  "price": 199,
  "category": "Menu Đặc Biệt",
  "availableFrom": "2026-01-18T10:00:00.000Z",
  "availableTo": "2026-01-19T22:00:00.000Z"
}
```

**Kết quả:** Món này sẽ hiển thị trong section **⭐ Đặc Biệt** vào cuối tuần cụ thể.

## 🎨 Customization

### Thay Đổi Khung Giờ Phân Loại

File: `TodaySpecialMenu.jsx`

```javascript
// Tìm function categorizeByTimePeriod()
const categorizeByTimePeriod = () => {
  // Thay đổi giờ ở đây:
  if (hours >= 6 && hours < 11) {        // Breakfast
  } else if (hours >= 11 && hours < 15) { // Lunch (thay 15 thành 16 để mở rộng)
  } else if (hours >= 17 && hours < 22) { // Dinner
  }
}
```

### Thay Đổi Auto-Refresh Interval

```javascript
// Tìm useEffect với setInterval
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date())
  }, 60000) // Thay 60000 (60s) thành 30000 (30s)
  
  return () => clearInterval(interval)
}, [])
```

### Thêm Category Mới

1. Thêm vào `translations`:

```javascript
const translations = {
  vi: {
    afternoon: '☕ Chiều', // New
    // ...
  },
  en: {
    afternoon: '☕ Afternoon', // New
    // ...
  }
}
```

2. Thêm vào `categorizeByTimePeriod()`:

```javascript
const categories = {
  breakfast: [],
  lunch: [],
  afternoon: [], // New
  dinner: [],
  special: []
}
```

3. Thêm logic phân loại:

```javascript
if (hours >= 15 && hours < 17) {
  categories.afternoon.push(item) // New
}
```

4. Thêm vào render:

```javascript
{renderCategory('afternoon', categorizedItems.afternoon)}
```

## 🔧 Troubleshooting

### Món không hiển thị?

1. **Check time settings:**
   ```bash
   # In database, check:
   dailyAvailability: {
     enabled: true,
     timeFrom: "11:00",
     timeTo: "14:30"
   }
   ```

2. **Check current time:**
   ```javascript
   console.log(new Date().toLocaleTimeString())
   // Ensure it's within the time range
   ```

3. **Check isFoodAvailable():**
   ```javascript
   import { isFoodAvailable } from '../../utils/timeUtils'
   console.log(isFoodAvailable(foodItem))
   ```

### Component không render?

```javascript
// Component tự ẩn nếu không có món time-based nào
if (!isLoadingFood && timeBasedItems.length === 0) {
  return null // Hide entirely
}
```

**Giải pháp:** Đảm bảo có ít nhất 1 món có time-based availability trong database.

### Thời gian không cập nhật?

```javascript
// Check interval đang chạy
useEffect(() => {
  console.log('Timer started')
  const interval = setInterval(() => {
    console.log('Updating time:', new Date())
    setCurrentTime(new Date())
  }, 60000)
  
  return () => {
    console.log('Timer stopped')
    clearInterval(interval)
  }
}, [])
```

## 📱 Responsive Breakpoints

| Device | Breakpoint | Grid Columns |
|--------|-----------|--------------|
| Desktop | > 1024px | auto-fill, minmax(280px, 1fr) |
| Tablet | 768px - 1024px | auto-fill, minmax(250px, 1fr) |
| Mobile | < 768px | auto-fill, minmax(220px, 1fr) |
| Small Mobile | < 480px | 1 column |

## 🎭 Animations

### 1. Pulse Animation (Clock Icon)
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### 2. Fade In Animation (Items)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3. Hover Effect (Cards)
```css
.time-menu-item-wrapper:hover {
  transform: translateY(-4px);
}
```

## 🌟 Best Practices

### 1. **Naming Convention**
```javascript
// Good
dailyAvailabilityEnabled: true
dailyTimeFrom: "11:00"
dailyTimeTo: "14:30"

// Bad
daily_availability_enabled: true
time_from: "11:00"
```

### 2. **Time Format**
```javascript
// Always use HH:MM (24-hour format)
"07:00" ✅
"7:00"  ❌
"07:00 AM" ❌
```

### 3. **Category Organization**
```javascript
// Group similar time periods
Breakfast: 06:00 - 11:00
Lunch:     11:00 - 15:00
Dinner:    17:00 - 22:00
```

### 4. **Performance**
```javascript
// Use useMemo for expensive calculations
const categorizedItems = useMemo(() => {
  return categorizeByTimePeriod()
}, [timeBasedItems])
```

## 📚 Related Files

- `Frontend/src/components/TodaySpecialMenu/TodaySpecialMenu.jsx` - Main component
- `Frontend/src/components/TodaySpecialMenu/TodaySpecialMenu.css` - Styles
- `Frontend/src/utils/timeUtils.js` - Time utility functions
- `Frontend/src/components/FoodItem/FoodItem.jsx` - Food item card
- `Backend/models/foodModel.js` - Food schema with time fields

## 🚀 Future Enhancements

### Potential Features:
1. **Countdown Timer** - "Available in 30 minutes"
2. **Notification Badge** - "New items available!"
3. **Filter by Time Period** - Toggle Breakfast/Lunch/Dinner
4. **Calendar View** - See upcoming special menus
5. **Push Notifications** - Alert when favorite items become available

## ✅ Checklist

- [x] Component created with full functionality
- [x] Multilingual support (VI/EN/SK)
- [x] Responsive design (Desktop/Tablet/Mobile)
- [x] Auto-refresh every minute
- [x] Smart categorization by time period
- [x] Loading and empty states
- [x] Beautiful animations
- [x] Integration with FoodItem component
- [x] Time badge display
- [x] Product detail popup support

## 💡 Tips

1. **Test với nhiều khung giờ khác nhau** để đảm bảo categorization hoạt động đúng
2. **Sử dụng Postman** để tạo test data với các time settings khác nhau
3. **Check console logs** để debug time availability issues
4. **Responsive testing** trên nhiều device sizes
5. **Performance monitoring** nếu có quá nhiều items (>100)

---

**Tạo bởi:** AI Assistant  
**Ngày cập nhật:** January 2026  
**Version:** 1.0.0
