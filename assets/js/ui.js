/**
 * AquaShield AI - UI & Visual Logic
 * Version 2.0.0 - Light Theme Edition
 */

// ============================================
// MENU TOGGLE
// ============================================
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        menu.classList.add('hidden');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Close menu when clicking a link (Mobile UX)
document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.mobile-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('mobileMenu');
            if (!menu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });
});

// ============================================
// MAP LOGIC
// ============================================
let mapInstance = null;
let markers = {};

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Check if map already initialized
    if (mapInstance) return;

    // Define Layers
    const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri'
    });

    // Rain Radar (RainViewer)
    const timeNow = Math.floor(Date.now() / 1000 / 600) * 600;
    const radarLayer = L.tileLayer(`https://tile.rainviewer.com/img/radar_nowcast_${timeNow}/512/{z}/{x}/{y}/2/1_1.png`, {
        attribution: '&copy; RainViewer',
        opacity: 0.7
    });

    // Initialize Map
    const map = L.map('map', {
        center: [CONFIG.LAT, CONFIG.LON],
        zoom: 10,
        layers: [lightLayer]
    });
    mapInstance = map;

    // Add Layer Controls
    const baseMaps = {
        "แผนที่ปกติ": lightLayer,
        "ดาวเทียม": satelliteLayer
    };
    const overlayMaps = {
        "🌧️ เรดาร์ฝน": radarLayer
    };
    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Custom Icons
    const createIcon = (color) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: ${color}; 
                width: 20px; 
                height: 20px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    };

    const icons = {
        HIGH: createIcon('#EF4444'),
        MED: createIcon('#FB923C'),
        LOW: createIcon('#22C55E')
    };

    // Add Markers
    const locations = [
        { id: 'm1', lat: 13.7563, lon: 100.5018, name: 'อ.เมือง สมุทรปราการ' },
        { id: 'm2', lat: 13.63, lon: 100.70, name: 'อ.บางพลี' },
        { id: 'm3', lat: 13.58, lon: 100.80, name: 'อ.บางบ่อ' },
        { id: 'm4', lat: 13.65, lon: 100.53, name: 'อ.พระประแดง' }
    ];

    locations.forEach(loc => {
        markers[loc.id] = L.marker([loc.lat, loc.lon], { icon: icons.LOW })
            .addTo(map)
            .bindPopup(`<b>${loc.name}</b><br>กำลังโหลด...`);
    });

    // Hide Loader
    const hideLoader = () => {
        const loader = document.getElementById('mapLoader');
        if (loader) loader.classList.add('hidden');
    };

    setTimeout(hideLoader, 1500);
}

// Update Map Markers
function updateMapMarkers(data) {
    if (!markers['m1']) return;

    const stations = [
        { id: 'm1', name: 'อ.เมือง', risk: 'HIGH', water: 4.2 + (Math.random() * 0.2) },
        { id: 'm2', name: 'อ.บางพลี', risk: 'MED', water: 3.8 + (Math.random() * 0.1) },
        { id: 'm3', name: 'อ.บางบ่อ', risk: 'LOW', water: 2.5 + (Math.random() * 0.05) },
        { id: 'm4', name: 'อ.พระประแดง', risk: 'LOW', water: 2.1 + (Math.random() * 0.05) }
    ];

    stations.forEach(st => {
        const marker = markers[st.id];
        if (marker) {
            const riskColor = st.risk === 'HIGH' ? '#EF4444' : st.risk === 'MED' ? '#FB923C' : '#22C55E';
            marker.setPopupContent(`
                <div style="font-family: 'Kanit', sans-serif; min-width: 150px;">
                    <b style="font-size: 1rem; color: #1F2937;">${st.name}</b><br>
                    <span style="font-size: 0.9rem;">ระดับน้ำ: <b>${st.water.toFixed(2)} m</b></span><br>
                    <span style="font-size: 0.85rem; color: ${riskColor}; font-weight: 600;">
                        สถานะ: ${st.risk === 'HIGH' ? 'สูง' : st.risk === 'MED' ? 'ปานกลาง' : 'ต่ำ'}
                    </span>
                </div>
            `);
        }
    });
}

// Make available globally
window.updateMapMarkers = updateMapMarkers;

// ============================================
// CHART LOGIC
// ============================================
let forecastChartInstance = null;

function generateForecastChart() {
    const canvas = document.getElementById('forecastChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');

    if (forecastChartInstance) forecastChartInstance.destroy();

    forecastChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0h', '4h', '8h', '12h', '16h', '20h', '24h', '28h', '32h', '36h', '40h', '48h'],
            datasets: [{
                label: 'ปริมาณน้ำฝน (mm)',
                data: [30, 45, 60, 75, 55, 40, 85, 70, 50, 65, 80, 45],
                borderColor: '#3B82F6',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#3B82F6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1F2937',
                    bodyColor: '#6B7280',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { family: 'Kanit', weight: '600' },
                    bodyFont: { family: 'Kanit' }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#9CA3AF',
                        font: { family: 'Kanit', size: 11 }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { family: 'Kanit', size: 11 },
                        stepSize: 20
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function updateChartWithApiData(dataPoints) {
    if (forecastChartInstance) {
        const dataset = forecastChartInstance.data.datasets[0];
        dataset.data = dataPoints;

        const rainEl = document.getElementById('apiRainfall');
        if (rainEl) {
            rainEl.textContent = realTimeRainfall + ' mm';
            rainEl.className = 'stat-api-value';
        }

        forecastChartInstance.update();
    }
}

// ============================================
// TIME DISPLAY
// ============================================
function updateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        timeEl.textContent = now.toLocaleDateString('th-TH', options);
    }
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-in');
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll('.feature-card, .partner-card, .step-card').forEach(el => {
        observer.observe(el);
    });
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
