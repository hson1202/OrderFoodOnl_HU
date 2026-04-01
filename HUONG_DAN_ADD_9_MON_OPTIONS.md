# Hướng Dẫn Add 9 Món Có Options (FIXED)

## ⚠️ VẤN ĐỀ ĐÃ FIX

**Lỗi trước**: `label` field dùng English làm default  
**Đã fix**: `label` field dùng **Hungarian** làm default (như món cũ đã add thành công)

### Format Đúng:
```json
"label": "csirkével",  // Hungarian (default)
"labelSK": "s kuracím mäsom",
"labelVI": "với thịt gà",
"labelEN": "with chicken"
```

## 🚀 CÁCH ADD TRONG POSTMAN

### Setup Ban Đầu

1. **Method**: POST
2. **URL**: `http://localhost:4000/api/food/add`
3. **Headers**: 
   - Key: `token`
   - Value: `your_admin_token`
4. **Body**: Chọn `form-data` (KHÔNG PHẢI raw JSON)

---

## 📋 9 MÓN CẦN ADD

### 1️⃣ FOCO (N008)

| Key | Value |
|-----|-------|
| sku | `N008` |
| name | `Foco` |
| nameSK | `Foco` |
| nameVI | `Nước Foco` |
| nameEN | `Foco Juice` |
| description | `Foco exotic juice drink` |
| category | `Drinks` |
| price | `2.50` |
| quantity | `100` |
| options | `[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"lychee","choices":[{"code":"lychee","label":"Liči","labelSK":"Liči","labelVI":"Vải","labelEN":"Lychee","price":2.50},{"code":"mango","label":"Mango","labelSK":"Mango","labelVI":"Xoài","labelEN":"Mango","price":2.50},{"code":"coconut","label":"Kokos","labelSK":"Kokos","labelVI":"Dừa","labelEN":"Coconut","price":2.50}]}]` |

---

### 2️⃣ VINUT (N009)

| Key | Value |
|-----|-------|
| sku | `N009` |
| name | `Vinut` |
| nameSK | `Vinut` |
| nameVI | `Nước Vinut` |
| nameEN | `Vinut Juice` |
| description | `Vinut juice drink` |
| category | `Drinks` |
| price | `2.50` |
| quantity | `100` |
| options | `[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"lychee","choices":[{"code":"lychee","label":"Liči","labelSK":"Liči","labelVI":"Vải","labelEN":"Lychee","price":2.50},{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":2.50},{"code":"coconut","label":"Kokos","labelSK":"Kokos","labelVI":"Dừa","labelEN":"Coconut","price":2.50}]}]` |

---

### 3️⃣ ALOE VERA (N010)

| Key | Value |
|-----|-------|
| sku | `N010` |
| name | `Aloe Vera` |
| nameSK | `Aloe Vera` |
| nameVI | `Nước Lô Hội` |
| nameEN | `Aloe Vera Drink` |
| description | `Aloe Vera drink` |
| category | `Drinks` |
| price | `2.50` |
| quantity | `100` |
| options | `[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"strawberry","choices":[{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":2.50},{"code":"mango","label":"Mango","labelSK":"Mango","labelVI":"Xoài","labelEN":"Mango","price":2.50}]}]` |

---

### 4️⃣ FUZETEA (N014)

| Key | Value |
|-----|-------|
| sku | `N014` |
| name | `Fuzetea` |
| nameSK | `Fuzetea` |
| nameVI | `Trà Fuzetea` |
| nameEN | `Fuzetea` |
| description | `Fuzetea ice tea` |
| category | `Drinks` |
| price | `2.00` |
| quantity | `100` |
| options | `[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"lemon","choices":[{"code":"lemon","label":"Citrón","labelSK":"Citrón","labelVI":"Chanh","labelEN":"Lemon","price":2.00},{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":2.00},{"code":"peach","label":"Broskyňa","labelSK":"Broskyňa","labelVI":"Đào","labelEN":"Peach","price":2.00}]}]` |

---

### 5️⃣ CAPPY (N015)

| Key | Value |
|-----|-------|
| sku | `N015` |
| name | `Cappy` |
| nameSK | `Cappy` |
| nameVI | `Nước ép Cappy` |
| nameEN | `Cappy Juice` |
| description | `Cappy fruit juice` |
| category | `Drinks` |
| price | `1.80` |
| quantity | `100` |
| options | `[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"orange","choices":[{"code":"orange","label":"Pomaranč","labelSK":"Pomaranč","labelVI":"Cam","labelEN":"Orange","price":1.80},{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":1.80},{"code":"apple","label":"Jablko","labelSK":"Jablko","labelVI":"Táo","labelEN":"Apple","price":1.80},{"code":"multivitamin","label":"Multivitamín","labelSK":"Multivitamín","labelVI":"Đa vitamin","labelEN":"Multivitamin","price":1.80}]}]` |

---

### 6️⃣ NEM CUON (P003)

| Key | Value |
|-----|-------|
| sku | `P003` |
| name | `Nem Cuon - Čerstvé Letné Závitky (2ks)` |
| nameSK | `Nem Cuon - Čerstvé Letné Závitky (2ks)` |
| nameVI | `Nem Cuốn - Gỏi Cuốn Tươi (2 cuốn)` |
| nameEN | `Fresh Spring Rolls (2pcs)` |
| description | `Rýžové rezance, šalát, vietnamské bylinky, krevety, kuracie mäso, zelenina obalovaná v rýžovom papieri, podávané s arašidovou omáčkou` |
| category | `Starters` |
| price | `4.50` |
| quantity | `100` |
| allergens | `2, 4, 5, 6` |
| options | `[{"name":"Náplň","nameSK":"Náplň","nameVI":"Nhân","nameEN":"Filling","type":"select","pricingMode":"override","defaultChoiceCode":"chicken","choices":[{"code":"chicken","label":"s kuracím mäsom","labelSK":"s kuracím mäsom","labelVI":"với thịt gà","labelEN":"with chicken","price":4.50},{"code":"shrimp","label":"s krevetami","labelSK":"s krevetami","labelVI":"với tôm","labelEN":"with shrimp","price":5.00},{"code":"vegetarian","label":"vegetariánske","labelSK":"vegetariánske","labelVI":"chay","labelEN":"vegetarian","price":4.50}]}]` |

---

### 7️⃣ NEM VYPRÁŽANÉ (P004)

| Key | Value |
|-----|-------|
| sku | `P004` |
| name | `Nem - Vyprážané Závitky (210g)` |
| nameSK | `Nem - Vyprážané Závitky (210g)` |
| nameVI | `Nem - Chả Giò Chiên (210g)` |
| nameEN | `Fried Spring Rolls (210g)` |
| description | `Vajce, zelenina, huby, sklenené rezance obalované v rýžovom papieri` |
| category | `Starters` |
| price | `5.00` |
| quantity | `100` |
| allergens | `3, 4, 6` |
| options | `[{"name":"Náplň","nameSK":"Náplň","nameVI":"Nhân","nameEN":"Filling","type":"select","pricingMode":"override","defaultChoiceCode":"pork","choices":[{"code":"pork","label":"s bravčovým mäsom","labelSK":"s bravčovým mäsom","labelVI":"với thịt heo","labelEN":"with pork","price":5.00},{"code":"vegetarian","label":"vegetariánske","labelSK":"vegetariánske","labelVI":"chay","labelEN":"vegetarian","price":5.00}]}]` |

---

### 8️⃣ TOM KHA GAI (PO005)

| Key | Value |
|-----|-------|
| sku | `PO005` |
| name | `Tom Kha Gai (0,3l)` |
| nameSK | `Tom Kha Gai (0,3l)` |
| nameVI | `Tom Kha Gà (0,3l)` |
| nameEN | `Tom Kha Gai (0.3l)` |
| description | `Thajská pikantná polievka, citrónová tráva, kokosové mlieko` |
| category | `Soups` |
| price | `3.00` |
| quantity | `100` |
| allergens | `2, 4, 6` |
| options | `[{"name":"Mäso","nameSK":"Mäso","nameVI":"Loại thịt","nameEN":"Protein","type":"select","pricingMode":"override","defaultChoiceCode":"chicken","choices":[{"code":"chicken","label":"s kuracím mäsom","labelSK":"s kuracím mäsom","labelVI":"với thịt gà","labelEN":"with chicken","price":3.00},{"code":"shrimp","label":"s krevetami","labelSK":"s krevetami","labelVI":"với tôm","labelEN":"with shrimp","price":3.50},{"code":"tofu","label":"s tofu","labelSK":"s tofu","labelVI":"với đậu phụ","labelEN":"with tofu","price":3.00}]}]` |

---

### 9️⃣ TOM YUM (PO006)

| Key | Value |
|-----|-------|
| sku | `PO006` |
| name | `Tom Yum (0,3l)` |
| nameSK | `Tom Yum (0,3l)` |
| nameVI | `Tom Yum (0,3l)` |
| nameEN | `Tom Yum (0.3l)` |
| description | `Mlieko, jemne pikantné, zelenina` |
| category | `Soups` |
| price | `3.00` |
| quantity | `100` |
| allergens | `2, 4, 6` |
| options | `[{"name":"Mäso","nameSK":"Mäso","nameVI":"Loại thịt","nameEN":"Protein","type":"select","pricingMode":"override","defaultChoiceCode":"chicken","choices":[{"code":"chicken","label":"s kuracím mäsom","labelSK":"s kuracím mäsom","labelVI":"với thịt gà","labelEN":"with chicken","price":3.00},{"code":"shrimp","label":"s krevetami","labelSK":"s krevetami","labelVI":"với tôm","labelEN":"with shrimp","price":3.50},{"code":"tofu","label":"s tofu","labelSK":"s tofu","labelVI":"với đậu phụ","labelEN":"with tofu","price":3.00}]}]` |

---

## ✅ CHECKLIST POSTMAN

Trước khi add, check lại:

- [ ] Method: **POST**
- [ ] URL: `http://localhost:4000/api/food/add`
- [ ] Header `token` đã có
- [ ] Body type: **form-data** (KHÔNG PHẢI raw)
- [ ] Field `options` là **string** (đã stringify)
- [ ] `label` field trong choices dùng **Hungarian** làm default

## 🎯 QUI TẮC QUAN TRỌNG

### Options Field Format:
```
Field options PHẢI là STRING đã stringify, KHÔNG PHẢI object!
```

### Label Order trong Choices:
```json
{
  "label": "csirkével",    // Hungarian (DEFAULT)
  "labelHU": "csirkével",  // Hungarian
  "labelVI": "với thịt gà",      // Vietnamese
  "labelEN": "with chicken"      // English
}
```

### Name Order trong Options:
```json
{
  "name": "Töltelék",        // Hungarian hoặc tên chung
  "nameHU": "Töltelék",      // Hungarian
  "nameVI": "Nhân",       // Vietnamese  
  "nameEN": "Filling"     // English
}
```

## 🔍 XỬ LÝ LỖI

### Lỗi 500:
- Check backend logs: `console.log` trong foodController
- Có thể do validation error trong foodModel

### Lỗi "Invalid options format":
- Field `options` phải là STRING (stringify)
- Phải có đủ: name, choices, defaultChoiceCode
- defaultChoiceCode phải tồn tại trong choices

### Lỗi "Category not found":
- Chạy: `Invoke-RestMethod -Uri "http://localhost:4000/api/category" -Method Get`
- Check xem category có trong database chưa

## 📝 GHI CHÚ

- Tất cả 9 món này đều có options
- Options dùng `pricingMode: "override"` (giá thay thế, không cộng thêm)
- Đã fix `label` field về Hungarian (theo format cũ thành công)

