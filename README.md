# AquaShield AI 🌊

> ระบบพยากรณ์และเตือนภัยน้ำท่วมฉับพลันอัจฉริยะ  
> AI-Powered Flash Flood Prediction & Early Warning System

## Version 2.0.0 - Light Theme Edition 🎨

เว็บไซต์นี้ได้รับการปรับปรุงใหม่โดยใช้ **PHP Framework** พร้อม **Light Theme** สีน้ำเงิน-ชมพู-ส้ม ที่ดูสดใสและทันสมัย รองรับการแสดงผลบนทุกอุปกรณ์

---

## 🚀 วิธีการใช้งาน

### Option 1: ใช้ XAMPP (แนะนำ)
1. ติดตั้ง [XAMPP](https://www.apachefriends.org/)
2. คัดลอกโฟลเดอร์โปรเจคไปที่ `C:\xampp\htdocs\aquashield-ai`
3. เปิด XAMPP Control Panel และ Start Apache
4. เปิดเบราว์เซอร์ไปที่ `http://localhost/aquashield-ai/`

### Option 2: ใช้ PHP Built-in Server
```bash
cd "g:\ประกวด 2026\AquaShield AI"
php -S localhost:8080
```
แล้วเปิด `http://localhost:8080`

### Option 3: ใช้ Laravel Valet หรือ Laragon
- วางโปรเจคในโฟลเดอร์ที่กำหนดและเข้าถึงผ่าน URL ที่ตั้งไว้

---

## 📁 โครงสร้างโปรเจค

```
AquaShield AI/
├── index.php                 # Main Router (Entry Point)
├── config/
│   └── config.php           # App Configuration
├── includes/
│   ├── header.php           # HTML Head & Navbar
│   └── footer.php           # Footer & Scripts
├── pages/
│   ├── home.php             # Landing Page
│   └── dashboard.php        # Dashboard Page
├── assets/
│   ├── css/
│   │   └── style.css        # Main Stylesheet (Light Theme)
│   └── js/
│       ├── config.js        # API Configuration
│       ├── ai-model.js      # Hydrological AI Model
│       ├── api.js           # API Handling
│       ├── ui.js            # UI Logic
│       └── app.js           # Main Application
├── db_schema.sql            # Database Schema
└── README.md                # Documentation
```

---

## 🎨 Design Features

### Light Theme
- **Primary Color**: Blue (#3B82F6)
- **Secondary Color**: Pink (#EC4899)
- **Accent Color**: Orange (#FB923C)
- **Background**: Light Gray (#FAFBFC)

### UI Components
- ✨ **Glassmorphism Cards** - การ์ดโปร่งใสแบบขุ่น
- 🌈 **Gradient Backgrounds** - พื้นหลังไล่สี
- 💫 **Smooth Animations** - แอนิเมชันลื่นไหล
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| 📱 Mobile | < 768px | 1 Column |
| 📟 Tablet | 768-1023px | 2 Columns |
| 💻 Desktop | ≥ 1024px | 4 Columns |

---

## 🔗 API Integration

- **OpenWeatherMap** - ข้อมูลสภาพอากาศปัจจุบัน
- **Tomorrow.io** - พยากรณ์อากาศ
- **RainViewer** - เรดาร์ฝน real-time
- **Supabase** - ฐานข้อมูล PostgreSQL

---

## 🛠 Technologies Used

- **Backend**: PHP 8.x
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **CSS Framework**: Custom CSS + CSS Variables
- **Charts**: Chart.js
- **Maps**: Leaflet.js
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Kanit)

---

## 📄 หน้าเว็บ

### 🏠 Home Page (`?page=home`)
- Hero Section พร้อม Animated Background
- Stats Cards (98% Accuracy, 48h Forecast, etc.)
- Features Section (4 Technology Cards)
- How It Works Section
- Partners Section
- CTA Section

### 📊 Dashboard (`?page=dashboard`)
- Real-time Stats Cards (Rainfall, Water Level, Risk)
- Interactive Map with Markers
- 48-Hour Forecast Chart
- Alert Panel with Notifications

---

## 🔧 Configuration

แก้ไขไฟล์ `config/config.php` เพื่อปรับแต่งแอพพลิเคชัน:

```php
define('APP_NAME', 'AquaShield AI');
define('APP_DESC', 'ระบบพยากรณ์และเตือนภัยน้ำท่วมฉับพลัน');
define('APP_VERSION', '2.0.0');
```

แก้ไขไฟล์ `assets/js/config.js` เพื่อปรับแต่ง API Keys:

```javascript
const CONFIG = {
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_KEY: 'your-supabase-key',
    OWM_KEY: 'your-openweathermap-key',
    TOMORROW_KEY: 'your-tomorrow-io-key',
    LAT: 13.7563,
    LON: 100.5018
};
```

---

## 📞 Contact

- **Project**: AquaShield AI
- **Version**: 2.0.0
- **Year**: 2026

---

© 2026 AquaShield AI. All rights reserved.
