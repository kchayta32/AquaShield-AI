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

// Map Logic
let mapInstance = null;
let markers = {}; // Store marker references

function initMap() {
    const isLocal = window.location.protocol === 'file:';

    // --- 1. Define Layers ---
    // Dark Theme (CartoDB Dark Matter)
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // Light Theme (OSM)
    const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    });

    // Rain Radar (RainViewer)
    // Timestamp logic to get latest available radar
    const timeNow = Math.floor(Date.now() / 1000 / 600) * 600; // Round to nearest 10 min
    const radarLayer = L.tileLayer(`https://tile.rainviewer.com/img/radar_nowcast_${timeNow}/512/{z}/{x}/{y}/2/1_1.png`, {
        attribution: '&copy; RainViewer',
        opacity: 0.8
    });

    // --- 2. Initialize Map ---
    // Use Dark by default
    const map = L.map('map', {
        center: [CONFIG.LAT, CONFIG.LON],
        zoom: 10,
        layers: [darkLayer] // Default layers
    });
    mapInstance = map;

    // --- 3. Add Controls ---
    const baseMaps = {
        "Theme: Dark": darkLayer,
        "Theme: Light": lightLayer
    };
    const overlayMaps = {
        "🌧️ Rain Radar": radarLayer
    };
    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // --- 4. Markers & Custom Icons ---
    const createIcon = (color) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem; border-radius: 50%; box-shadow: 0 0 10px ${color}; border: 2px solid white;"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    const icons = {
        HIGH: createIcon('#ef4444'),   // Red
        MED: createIcon('#f97316'),    // Orange
        LOW: createIcon('#22c55e')     // Green
    };

    // Create Markers (Store in object for updates)
    const locations = [
        { id: 'm1', lat: 13.7563, lon: 100.5018, name: 'อ.เมือง' },
        { id: 'm2', lat: 13.63, lon: 100.70, name: 'อ.บางพลี' },
        { id: 'm3', lat: 13.58, lon: 100.80, name: 'อ.บางบ่อ' },
        { id: 'm4', lat: 13.65, lon: 100.53, name: 'อ.พระประแดง' }
    ];

    locations.forEach(loc => {
        markers[loc.id] = L.marker([loc.lat, loc.lon], { icon: icons.LOW })
            .addTo(map)
            .bindPopup(`<b>${loc.name}</b><br>Loading...`, { className: 'custom-popup' });
    });

    // Helper to hide loader
    const hideLoader = () => {
        const loader = document.getElementById('mapLoader');
        if (loader) loader.classList.add('hidden');
    };

    // Notify if running local/Windy check
    if (!isLocal) {
        // Windy API logic already handles map creation via callback
        // But strictly speaking, initMap logic above mostly sets up Leaflet layers
        // We should ensure loader hides after setup
        setTimeout(hideLoader, 1000); // Small buffer for tiles to load
    } else {
        console.log("Running in Local Fallback Mode with Leaflet");
        hideLoader(); // Hide immediately for local
    }
}

// Function to update markers with real data
function updateMapMarkers(data) {
    if (!markers['m1']) return; // Map not init

    // Simulate different values for each location based on the central "simulation" data
    // In real app, 'data' would be an array of sensors

    const stations = [
        { id: 'm1', name: 'อ.เมือง', risk: 'HIGH', water: 4.2 + (Math.random() * 0.2) },
        { id: 'm2', name: 'อ.บางพลี', risk: 'MED', water: 3.8 + (Math.random() * 0.1) },
        { id: 'm3', name: 'อ.บางบ่อ', risk: 'LOW', water: 2.5 + (Math.random() * 0.05) },
        { id: 'm4', name: 'อ.พระประแดง', risk: 'LOW', water: 2.1 + (Math.random() * 0.05) }
    ];

    stations.forEach(st => {
        const marker = markers[st.id];
        if (marker) {
            // Update Popup
            marker.setPopupContent(`
                <div class="text-gray-800">
                    <b class="text-lg">${st.name}</b><br>
                    <span class="text-sm">ระดับน้ำ: <b>${st.water.toFixed(2)}m</b></span><br>
                    <span class="text-xs ${st.risk === 'HIGH' ? 'text-red-600' : 'text-green-600'}">
                        สถานะ: ${st.risk}
                    </span>
                </div>
            `);
        }
    });
}

// Chart Logic
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
                data: [30, 45, 60, 75, 55, 40, 85, 70, 50, 65, 80, 45], // Default data
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

// Time
function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const timeEl = document.getElementById('currentTime');
    if (timeEl) timeEl.textContent = now.toLocaleDateString('th-TH', options);
}
