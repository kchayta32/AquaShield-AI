<!-- Dashboard Header -->
<section class="dashboard-header">
    <div class="dashboard-container">
        <div class="header-content">
            <div class="header-info">
                <h1 class="dashboard-title">แดชบอร์ดเตือนภัย</h1>
                <p class="dashboard-subtitle">ระบบติดตามและพยากรณ์น้ำท่วมแบบ Real-time</p>
            </div>
            <div class="header-status">
                <div class="status-badge active">
                    <span class="status-dot"></span>
                    <span>ระบบทำงานปกติ</span>
                </div>
                <div class="current-time" id="currentTime"></div>
            </div>
        </div>
    </div>
</section>

<!-- Stats Cards -->
<section class="stats-section">
    <div class="dashboard-container">
        <div class="stats-cards">
            <!-- Rainfall Card -->
            <div class="stat-card glass-card">
                <div class="card-header">
                    <div class="card-icon bg-blue">
                        <i class="fa-solid fa-cloud-rain"></i>
                    </div>
                    <span class="update-time">อัพเดท 5 นาทีที่แล้ว</span>
                </div>
                <div class="card-body">
                    <div class="stat-value" id="rainfallValue">45.2 mm</div>
                    <div class="stat-name">ปริมาณน้ำฝน (Rainfall)</div>
                    <div class="progress-bar">
                        <div class="progress-fill bg-blue" style="width: 45%"></div>
                    </div>
                </div>
            </div>

            <!-- Water Level Card -->
            <div class="stat-card glass-card">
                <div class="card-header">
                    <div class="card-icon bg-pink">
                        <i class="fa-solid fa-water"></i>
                    </div>
                    <span class="update-time">อัพเดท 2 นาทีที่แล้ว</span>
                </div>
                <div class="card-body">
                    <div class="stat-value" id="waterLevel">3.8 m</div>
                    <div class="stat-name">ระดับน้ำ (Water Level)</div>
                    <div class="progress-bar">
                        <div class="progress-fill bg-pink" style="width: 65%"></div>
                    </div>
                </div>
            </div>

            <!-- Risk Level Card -->
            <div class="stat-card glass-card">
                <div class="card-header">
                    <div class="card-icon bg-orange">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <span class="update-time">คำนวณแบบ Real-time</span>
                </div>
                <div class="card-body">
                    <div class="stat-value warning" id="riskLevel">ปานกลาง</div>
                    <div class="stat-name">ความเสี่ยง (Risk Level)</div>
                    <div class="progress-bar">
                        <div class="progress-fill bg-orange" style="width: 55%"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Map & Chart Section -->
<section class="map-section">
    <div class="dashboard-container">
        <div class="map-grid">
            <!-- Map Panel -->
            <div class="map-panel glass-card">
                <div class="panel-header">
                    <h2 class="panel-title">
                        <i class="fa-solid fa-map-location-dot"></i>
                        แผนที่พื้นที่เสี่ยงภัย
                    </h2>
                    <div class="map-controls">
                        <button class="map-btn active">ดาวเทียม</button>
                        <button class="map-btn">แผนที่ปกติ</button>
                    </div>
                </div>
                <div class="map-wrapper">
                    <div id="map" class="map-container">
                        <!-- Map Loading -->
                        <div id="mapLoader" class="map-loader">
                            <div class="loader-spinner"></div>
                            <span>กำลังโหลดแผนที่...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Forecast Chart Panel -->
            <div class="chart-panel glass-card">
                <div class="panel-header">
                    <h2 class="panel-title">
                        <i class="fa-solid fa-chart-line"></i>
                        พยากรณ์ 48 ชั่วโมง
                    </h2>
                </div>
                <div class="chart-wrapper">
                    <canvas id="forecastChart"></canvas>
                </div>
                <div class="chart-stats">
                    <div class="chart-stat">
                        <span class="stat-label">ปริมาณน้ำฝน (API)</span>
                        <span class="stat-api-value" id="apiRainfall">Loading...</span>
                    </div>
                    <div class="chart-stat">
                        <span class="stat-label">ระดับน้ำคาดการณ์</span>
                        <span class="stat-api-value pink" id="predictedWater">Calculating...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Alert Panel -->
<section class="alert-section">
    <div class="dashboard-container">
        <div class="alert-panel glass-card">
            <div class="panel-header">
                <h2 class="panel-title">
                    <i class="fa-solid fa-bell"></i>
                    การแจ้งเตือนล่าสุด
                </h2>
                <span class="alert-badge blink-alert">3 แจ้งเตือนใหม่</span>
            </div>
            <div class="alert-list" id="alertList">
                <!-- High Alert -->
                <div class="alert-item high">
                    <div class="alert-icon">
                        <i class="fa-solid fa-exclamation"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-header">
                            <span class="alert-level">แจ้งเตือนระดับสูง</span>
                            <span class="alert-time">2 นาทีที่แล้ว</span>
                        </div>
                        <p class="alert-message">ตรวจพบปริมาณน้ำฝนเกินค่าวิกฤติที่ อ.เมือง จ.สมุทรปราการ
                            คาดการณ์น้ำท่วมภายใน 2-4 ชั่วโมง</p>
                    </div>
                </div>

                <!-- Medium Alert -->
                <div class="alert-item medium">
                    <div class="alert-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-header">
                            <span class="alert-level">แจ้งเตือนระดับปานกลาง</span>
                            <span class="alert-time">15 นาทีที่แล้ว</span>
                        </div>
                        <p class="alert-message">ระดับน้ำในคลองประเวศเพิ่มขึ้น 0.5 เมตร ติดตามสถานการณ์อย่างใกล้ชิด</p>
                    </div>
                </div>

                <!-- Info Alert -->
                <div class="alert-item info">
                    <div class="alert-icon">
                        <i class="fa-solid fa-info"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-header">
                            <span class="alert-level">ข้อมูลอัพเดท</span>
                            <span class="alert-time">30 นาทีที่แล้ว</span>
                        </div>
                        <p class="alert-message">ระบบได้รับข้อมูลภาพถ่ายดาวเทียมล่าสุด กำลังประมวลผลด้วย AI</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Initialize Dashboard -->
<script>
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof initApp === 'function') {
            initApp();
        }
    });
</script>