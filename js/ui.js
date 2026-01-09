// UI & Visual Logic

// Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    // Toggle hidden
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.classList.add('mobile-menu-enter');
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('mobile-menu-enter');
    }
}

// Close menu when clicking a link (Mobile UX fix)
document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('#mobileMenu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('mobileMenu');
            if (!menu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });
});

// Page Navigation
function showLanding() {
    document.getElementById('landingPage').classList.remove('hidden-page');
    document.getElementById('landingPage').classList.add('visible-page');
    document.getElementById('dashboardPage').classList.remove('visible-page');
    document.getElementById('dashboardPage').classList.add('hidden-page');
}

function showDashboard() {
    document.getElementById('dashboardPage').classList.remove('hidden-page');
    document.getElementById('dashboardPage').classList.add('visible-page');
    document.getElementById('landingPage').classList.remove('visible-page');
    document.getElementById('landingPage').classList.add('hidden-page');
    initApp(); // Call main app init
}

// ============================================
// MapTiler Weather SDK Implementation
// ============================================

let mapInstance = null;
let weatherLayers = {};
let currentWeatherLayer = 'precipitation';
let isAnimating = false;
let animationInterval = null;
let markers = [];

// Weather layer configurations
const WEATHER_LAYER_CONFIG = {
    precipitation: {
        name: 'PrecipitationLayer',
        unit: 'mm/h',
        label: 'ปริมาณฝน'
    },
    temperature: {
        name: 'TemperatureLayer',
        unit: '°C',
        label: 'อุณหภูมิ'
    },
    wind: {
        name: 'WindLayer',
        unit: 'km/h',
        label: 'ความเร็วลม'
    },
    radar: {
        name: 'RadarLayer',
        unit: 'dBZ',
        label: 'เรดาร์'
    }
};

async function initMap() {
    // Set MapTiler API Key
    maptilersdk.config.apiKey = CONFIG.MAPTILER_KEY;

    // Initialize Map with dark style
    mapInstance = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.DATAVIZ.DARK,
        center: [CONFIG.LON, CONFIG.LAT], // Bangkok
        zoom: 9,
        pitch: 0,
        bearing: 0
    });

    mapInstance.on('load', async () => {
        console.log('MapTiler map loaded successfully');

        // Hide loader
        const loader = document.getElementById('mapLoader');
        if (loader) loader.classList.add('hidden');

        // Initialize weather layers
        await initWeatherLayers();

        // Add risk zone markers
        addRiskMarkers();

        // Setup mouse move for weather picker
        setupWeatherPicker();

        // Setup timeline slider
        setupTimelineSlider();
    });

    mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        const loader = document.getElementById('mapLoader');
        if (loader) {
            loader.innerHTML = '<span class="text-red-400 text-sm">ไม่สามารถโหลดแผนที่ได้</span>';
        }
    });
}

async function initWeatherLayers() {
    try {
        // Create precipitation layer (default)
        weatherLayers.precipitation = new maptilerweather.PrecipitationLayer({
            opacity: 0.8
        });

        // Create temperature layer
        weatherLayers.temperature = new maptilerweather.TemperatureLayer({
            opacity: 0.7
        });

        // Create wind layer
        weatherLayers.wind = new maptilerweather.WindLayer({
            opacity: 0.6
        });

        // Create radar layer
        weatherLayers.radar = new maptilerweather.RadarLayer({
            opacity: 0.8
        });

        // Add default layer (precipitation)
        mapInstance.addLayer(weatherLayers.precipitation, 'Water');

        console.log('Weather layers initialized');
    } catch (error) {
        console.error('Error initializing weather layers:', error);
    }
}

function setWeatherLayer(layerType) {
    if (!mapInstance || !weatherLayers[layerType]) return;

    // Remove current layer
    if (weatherLayers[currentWeatherLayer]) {
        try {
            mapInstance.removeLayer(weatherLayers[currentWeatherLayer].id);
        } catch (e) {
            // Layer might not exist
        }
    }

    // Add new layer
    try {
        mapInstance.addLayer(weatherLayers[layerType], 'Water');
        currentWeatherLayer = layerType;

        // Update button states
        updateLayerButtons(layerType);

        console.log(`Switched to ${layerType} layer`);
    } catch (error) {
        console.error('Error switching layer:', error);
    }
}

function updateLayerButtons(activeLayer) {
    const buttons = document.querySelectorAll('.weather-layer-btn');
    buttons.forEach(btn => {
        const layer = btn.getAttribute('data-layer');
        if (layer === activeLayer) {
            btn.classList.remove('bg-white/5', 'text-gray-400', 'border-white/10');
            btn.classList.add('bg-primary-500/30', 'text-primary-300', 'border-primary-500/50', 'active');
        } else {
            btn.classList.add('bg-white/5', 'text-gray-400', 'border-white/10');
            btn.classList.remove('bg-primary-500/30', 'text-primary-300', 'border-primary-500/50', 'active');
        }
    });
}

function addRiskMarkers() {
    // Risk zone locations
    const locations = [
        { lat: 13.7563, lon: 100.5018, name: 'อ.เมือง', risk: 'HIGH' },
        { lat: 13.63, lon: 100.70, name: 'อ.บางพลี', risk: 'MED' },
        { lat: 13.58, lon: 100.80, name: 'อ.บางบ่อ', risk: 'LOW' },
        { lat: 13.65, lon: 100.53, name: 'อ.พระประแดง', risk: 'LOW' }
    ];

    const riskColors = {
        HIGH: '#ef4444',
        MED: '#f97316',
        LOW: '#22c55e'
    };

    locations.forEach(loc => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'risk-marker';
        el.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: ${riskColors[loc.risk]};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 15px ${riskColors[loc.risk]}, 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
        `;
        el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.3)');
        el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');

        // Create popup
        const popup = new maptilersdk.Popup({
            offset: 25,
            className: 'risk-popup'
        }).setHTML(`
            <div style="padding: 8px; min-width: 140px;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${loc.name}</div>
                <div style="font-size: 12px; color: #666;">ระดับน้ำ: <b>${(2.5 + Math.random() * 2).toFixed(2)}m</b></div>
                <div style="font-size: 11px; color: ${riskColors[loc.risk]}; font-weight: 500;">
                    ความเสี่ยง: ${loc.risk === 'HIGH' ? 'สูง' : loc.risk === 'MED' ? 'ปานกลาง' : 'ต่ำ'}
                </div>
            </div>
        `);

        // Create marker
        const marker = new maptilersdk.Marker({ element: el })
            .setLngLat([loc.lon, loc.lat])
            .setPopup(popup)
            .addTo(mapInstance);

        markers.push({ marker, location: loc });
    });
}

function setupWeatherPicker() {
    const infoPanel = document.getElementById('weatherInfoPanel');
    const locationEl = document.getElementById('weatherLocation');
    const valueEl = document.getElementById('weatherValue');
    const unitEl = document.getElementById('weatherUnit');

    mapInstance.on('mousemove', async (e) => {
        const { lng, lat } = e.lngLat;
        const layer = weatherLayers[currentWeatherLayer];

        if (layer && typeof layer.pickAt === 'function') {
            try {
                const value = await layer.pickAt(lng, lat);
                if (value !== null && value !== undefined) {
                    infoPanel.classList.remove('hidden');
                    locationEl.textContent = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;

                    const config = WEATHER_LAYER_CONFIG[currentWeatherLayer];
                    if (currentWeatherLayer === 'temperature') {
                        valueEl.textContent = `${value.toFixed(1)}${config.unit}`;
                    } else if (currentWeatherLayer === 'wind') {
                        valueEl.textContent = `${(value * 3.6).toFixed(1)} ${config.unit}`;
                    } else {
                        valueEl.textContent = `${value.toFixed(2)} ${config.unit}`;
                    }
                    unitEl.textContent = config.label;
                }
            } catch (e) {
                // Silently fail for picker errors
            }
        }
    });

    mapInstance.on('mouseleave', () => {
        infoPanel.classList.add('hidden');
    });
}

function setupTimelineSlider() {
    const slider = document.getElementById('timelineSlider');
    const label = document.getElementById('timelineLabel');

    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const layer = weatherLayers[currentWeatherLayer];

        if (layer && typeof layer.setAnimationTime === 'function') {
            // Calculate time offset (0-100 -> 0-96 hours = 4 days)
            const hoursOffset = (value / 100) * 96;
            const targetTime = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);

            layer.setAnimationTime(targetTime.getTime());

            // Update label
            if (hoursOffset < 1) {
                label.textContent = 'ปัจจุบัน';
            } else if (hoursOffset < 24) {
                label.textContent = `+${Math.round(hoursOffset)} ชม.`;
            } else {
                const days = Math.floor(hoursOffset / 24);
                label.textContent = `+${days} วัน`;
            }
        }
    });
}

function toggleWeatherAnimation() {
    const icon = document.getElementById('playPauseIcon');
    const layer = weatherLayers[currentWeatherLayer];

    if (!layer) return;

    if (isAnimating) {
        // Stop animation
        if (typeof layer.animateByFactor === 'function') {
            layer.animateByFactor(0);
        }
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        isAnimating = false;
    } else {
        // Start animation
        if (typeof layer.animateByFactor === 'function') {
            layer.animateByFactor(3600); // 1 hour per second
        }
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        isAnimating = true;
    }
}

// Function to update markers with real data (called from app.js)
function updateMapMarkers(data) {
    if (!markers.length) return;

    markers.forEach((m, i) => {
        const waterLevel = data.waterLevel ? data.waterLevel + (Math.random() * 0.5 - 0.25) : 3.0;
        const risk = waterLevel > 4 ? 'HIGH' : waterLevel > 3.5 ? 'MED' : 'LOW';

        const riskColors = {
            HIGH: '#ef4444',
            MED: '#f97316',
            LOW: '#22c55e'
        };

        // Update popup content
        m.marker.getPopup().setHTML(`
            <div style="padding: 8px; min-width: 140px;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${m.location.name}</div>
                <div style="font-size: 12px; color: #666;">ระดับน้ำ: <b>${waterLevel.toFixed(2)}m</b></div>
                <div style="font-size: 11px; color: ${riskColors[risk]}; font-weight: 500;">
                    ความเสี่ยง: ${risk === 'HIGH' ? 'สูง' : risk === 'MED' ? 'ปานกลาง' : 'ต่ำ'}
                </div>
            </div>
        `);
    });
}

// ============================================
// Chart Logic
// ============================================

let forecastChartInstance = null;
function generateForecastChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    if (forecastChartInstance) forecastChartInstance.destroy();

    forecastChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0h', '4h', '8h', '12h', '16h', '20h', '24h', '28h', '32h', '36h', '40h', '48h'],
            datasets: [{
                label: 'ปริมาณน้ำฝน (mm)',
                data: [30, 45, 60, 75, 55, 40, 85, 70, 50, 65, 80, 45],
                borderColor: '#60a5fa',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1e3a8a',
                pointBorderColor: '#60a5fa',
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
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#9ca3af',
                    bodyColor: '#fff',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#9ca3af', font: { family: 'Kanit' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                    ticks: { color: '#9ca3af', font: { family: 'Kanit' }, stepSize: 20 },
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

        // Update Rainfall Text (if passed successfully)
        const rainEl = document.getElementById('apiRainfall');
        if (rainEl) {
            rainEl.textContent = realTimeRainfall + ' mm';
            rainEl.className = 'text-lg font-semibold text-primary-400';
        }

        forecastChartInstance.update();
    }
}

// ============================================
// Time Display
// ============================================

function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const timeEl = document.getElementById('currentTime');
    if (timeEl) timeEl.textContent = now.toLocaleDateString('th-TH', options);
}
