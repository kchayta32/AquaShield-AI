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
// MAP LOGIC - MapLibre GL JS (3D Support)
// ============================================
let mapInstance = null;
let mapMarkers = [];

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Check if map already initialized
    if (mapInstance) return;

    // Check if MapLibre is available
    if (typeof maplibregl === 'undefined') {
        console.error('MapLibre GL JS not loaded!');
        return;
    }

    // Initialize MapLibre GL Map
    const map = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${CONFIG.MAPTILER_KEY}`,
        center: [CONFIG.LON, CONFIG.LAT], // Note: MapLibre uses [lng, lat]
        zoom: 11,
        pitch: 45, // Initial tilt angle (0-85)
        bearing: -17.6, // Initial rotation angle
        antialias: true
    });

    mapInstance = map;

    // Add Navigation Controls (Zoom, Rotation, Pitch)
    map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
    }), 'top-right');

    // Add Scale Control
    map.addControl(new maplibregl.ScaleControl({
        maxWidth: 150,
        unit: 'metric'
    }), 'bottom-left');

    // Add Fullscreen Control
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    // Add Geolocate Control
    map.addControl(new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    }), 'top-right');

    // When map loads
    map.on('load', () => {
        console.log('🗺️ MapLibre GL JS Map Loaded!');

        // Add 3D Terrain (if supported)
        map.addSource('terrain', {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${CONFIG.MAPTILER_KEY}`,
            tileSize: 256
        });

        // Enable 3D terrain effect
        map.setTerrain({ source: 'terrain', exaggeration: 1.2 });

        // Add Sky layer for realistic 3D effect
        map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 90.0],
                'sky-atmosphere-sun-intensity': 15
            }
        });

        // Add Weather Layers (OpenWeatherMap)
        const weatherLayers = [
            { id: 'precipitation', name: '🌧️ ปริมาณน้ำฝน', type: 'precipitation_new', active: true },
            { id: 'clouds', name: '☁️ เมฆปกคลุม', type: 'clouds_new', active: false },
            { id: 'temp', name: '🌡️ อุณหภูมิ', type: 'temp_new', active: false },
            { id: 'wind', name: '💨 ลม', type: 'wind_new', active: false }
        ];

        weatherLayers.forEach(layer => {
            map.addSource(`owm-${layer.id}`, {
                type: 'raster',
                tiles: [`https://tile.openweathermap.org/map/${layer.type}/{z}/{x}/{y}.png?appid=${CONFIG.OWM_KEY}`],
                tileSize: 256,
                attribution: '© OpenWeatherMap'
            });

            map.addLayer({
                id: `${layer.id}-layer`,
                type: 'raster',
                source: `owm-${layer.id}`,
                paint: { 'raster-opacity': 0.85 },
                layout: { visibility: layer.active ? 'visible' : 'none' }
            });
        });

        // Create Weather Layer Control
        createWeatherLayerControl(map, weatherLayers);

        // Add Monitoring Station Markers
        addMonitoringStations(map);

        // Hide Loader
        const loader = document.getElementById('mapLoader');
        if (loader) loader.classList.add('hidden');
    });

    // Add Style Switcher
    createStyleSwitcher(map);
}

// Create Weather Layer Control
function createWeatherLayerControl(map, layers) {
    // Store active layers for tooltip
    window.activeWeatherLayers = layers.filter(l => l.active).map(l => l.id);

    const control = document.createElement('div');
    control.className = 'weather-layer-control';
    control.id = 'weatherControl';
    control.innerHTML = `
        <div class="weather-control-collapsed" id="weatherCollapsed">
            <i class="fa-solid fa-layer-group"></i>
        </div>
        <div class="weather-control-expanded" id="weatherExpanded">
            <div class="weather-control-header">
                <i class="fa-solid fa-layer-group"></i>
                <span>ชั้นข้อมูลสภาพอากาศ</span>
                <button class="weather-collapse-btn" id="collapseWeatherBtn">
                    <i class="fa-solid fa-minus"></i>
                </button>
            </div>
            <div class="weather-control-body">
                ${layers.map(layer => `
                    <label class="weather-layer-item">
                        <input type="checkbox" data-layer="${layer.id}" ${layer.active ? 'checked' : ''}>
                        <span>${layer.name}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    // Add to map container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.appendChild(control);
    }

    // Collapse/Expand functionality
    const collapsed = document.getElementById('weatherCollapsed');
    const expanded = document.getElementById('weatherExpanded');
    const collapseBtn = document.getElementById('collapseWeatherBtn');

    collapsed.addEventListener('click', () => {
        control.classList.remove('collapsed');
    });

    collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        control.classList.add('collapsed');
    });

    // Make collapsed version draggable
    makeDraggable(control);

    // Handle layer toggle
    control.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const layerId = e.target.dataset.layer;
            const visibility = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty(`${layerId}-layer`, 'visibility', visibility);

            // Update active layers
            if (e.target.checked) {
                if (!window.activeWeatherLayers.includes(layerId)) {
                    window.activeWeatherLayers.push(layerId);
                }
            } else {
                window.activeWeatherLayers = window.activeWeatherLayers.filter(l => l !== layerId);
            }
        });
    });

    // Create hover tooltip
    createWeatherTooltip(map);
}

// Make element draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const collapsed = element.querySelector('.weather-control-collapsed');

    collapsed.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        if (!element.classList.contains('collapsed')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.right = "auto";
        element.style.bottom = "auto";
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
    }
}

// Create weather hover tooltip
function createWeatherTooltip(map) {
    const tooltip = document.createElement('div');
    tooltip.className = 'weather-tooltip';
    tooltip.id = 'weatherTooltip';
    tooltip.style.display = 'none';
    document.getElementById('map').appendChild(tooltip);

    const layerLabels = {
        'precipitation': { name: '🌧️ ปริมาณน้ำฝน', unit: 'mm' },
        'clouds': { name: '☁️ เมฆปกคลุม', unit: '%' },
        'temp': { name: '🌡️ อุณหภูมิ', unit: '°C' },
        'wind': { name: '💨 ความเร็วลม', unit: 'm/s' }
    };

    map.on('mousemove', async (e) => {
        const activeLayers = window.activeWeatherLayers || [];
        if (activeLayers.length === 0) {
            tooltip.style.display = 'none';
            return;
        }

        // Simulate weather data based on position (mock data for demo)
        const lat = e.lngLat.lat;
        const lon = e.lngLat.lng;

        // Generate mock values based on position
        const mockData = {
            precipitation: Math.max(0, (Math.sin(lat * 10) * 20 + Math.random() * 5)).toFixed(1),
            clouds: Math.floor(Math.abs(Math.sin(lon * 5) * 100)),
            temp: (25 + Math.sin(lat) * 8 + Math.random() * 3).toFixed(1),
            wind: (Math.abs(Math.cos(lon * 3) * 15) + Math.random() * 2).toFixed(1)
        };

        // Build tooltip content
        let content = activeLayers.map(layerId => {
            const info = layerLabels[layerId];
            if (info) {
                return `<div class="tooltip-row">
                    <span>${info.name}</span>
                    <strong>${mockData[layerId]} ${info.unit}</strong>
                </div>`;
            }
            return '';
        }).join('');

        if (content) {
            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            tooltip.style.left = (e.point.x + 15) + 'px';
            tooltip.style.top = (e.point.y + 15) + 'px';
        }
    });

    map.on('mouseout', () => {
        tooltip.style.display = 'none';
    });
}


// Add Monitoring Stations
function addMonitoringStations(map) {
    const stations = [
        { id: 'm1', lat: 13.5991, lng: 100.5998, name: 'อ.เมืองสมุทรปราการ', risk: 'MED', water: 3.2 },
        { id: 'm2', lat: 13.6300, lng: 100.7000, name: 'อ.บางพลี', risk: 'LOW', water: 2.1 },
        { id: 'm3', lat: 13.5800, lng: 100.8000, name: 'อ.บางบ่อ', risk: 'LOW', water: 1.8 },
        { id: 'm4', lat: 13.6500, lng: 100.5300, name: 'อ.พระประแดง', risk: 'MED', water: 3.5 },
        { id: 'm5', lat: 13.5400, lng: 100.6200, name: 'อ.พระสมุทรเจดีย์', risk: 'HIGH', water: 4.8 }
    ];

    const riskColors = { HIGH: '#EF4444', MED: '#F59E0B', LOW: '#22C55E' };
    const riskLabels = { HIGH: 'สูง', MED: 'ปานกลาง', LOW: 'ต่ำ' };

    stations.forEach(st => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'maplibre-marker';
        el.innerHTML = `
            <div class="marker-container ${st.risk === 'HIGH' ? 'pulse-high' : ''}">
                <div class="marker-dot" style="background: ${riskColors[st.risk]};"></div>
                <div class="marker-ring" style="border-color: ${riskColors[st.risk]};"></div>
            </div>
        `;

        // Create popup
        const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
            .setHTML(`
                <div class="map-popup">
                    <div class="popup-header">
                        <span class="popup-icon" style="background: ${riskColors[st.risk]}"></span>
                        <strong>${st.name}</strong>
                    </div>
                    <div class="popup-stats">
                        <div class="popup-stat">
                            <span class="stat-label">ระดับน้ำ</span>
                            <span class="stat-value">${st.water.toFixed(2)} m</span>
                        </div>
                        <div class="popup-stat">
                            <span class="stat-label">ความเสี่ยง</span>
                            <span class="stat-value" style="color: ${riskColors[st.risk]}">${riskLabels[st.risk]}</span>
                        </div>
                    </div>
                </div>
            `);

        // Add marker to map
        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([st.lng, st.lat])
            .setPopup(popup)
            .addTo(map);

        mapMarkers.push(marker);
    });
}

// Create Style Switcher Control
function createStyleSwitcher(map) {
    const styles = {
        'streets': { name: '🗺️ ถนน', url: `https://api.maptiler.com/maps/streets-v2/style.json?key=${CONFIG.MAPTILER_KEY}` },
        'satellite': { name: '🛰️ ดาวเทียม', url: `https://api.maptiler.com/maps/hybrid/style.json?key=${CONFIG.MAPTILER_KEY}` },
        'topo': { name: '⛰️ ภูมิประเทศ', url: `https://api.maptiler.com/maps/topo-v2/style.json?key=${CONFIG.MAPTILER_KEY}` },
        'outdoor': { name: '🏕️ Outdoor', url: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${CONFIG.MAPTILER_KEY}` }
    };

    // Create switcher container
    const switcher = document.createElement('div');
    switcher.className = 'map-style-switcher';
    switcher.innerHTML = Object.entries(styles).map(([key, style]) =>
        `<button class="style-btn ${key === 'streets' ? 'active' : ''}" data-style="${key}">${style.name}</button>`
    ).join('');

    // Add to map container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.appendChild(switcher);
    }

    // Handle style switching
    switcher.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const styleKey = btn.dataset.style;
            map.setStyle(styles[styleKey].url);

            // Update active state
            switcher.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-add weather layers and markers after style change
            map.once('style.load', () => {
                reAddWeatherLayers(map);

                // Re-add markers
                mapMarkers.forEach(m => m.remove());
                mapMarkers = [];
                addMonitoringStations(map);
            });
        });
    });
}

// Re-add weather layers after style change
function reAddWeatherLayers(map) {
    const weatherLayerConfigs = [
        { id: 'precipitation', type: 'precipitation_new' },
        { id: 'clouds', type: 'clouds_new' },
        { id: 'temp', type: 'temp_new' },
        { id: 'wind', type: 'wind_new' }
    ];

    const activeLayers = window.activeWeatherLayers || ['precipitation'];

    weatherLayerConfigs.forEach(layer => {
        const sourceId = `owm-${layer.id}`;
        const layerId = `${layer.id}-layer`;

        // Add source if not exists
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'raster',
                tiles: [`https://tile.openweathermap.org/map/${layer.type}/{z}/{x}/{y}.png?appid=${CONFIG.OWM_KEY}`],
                tileSize: 256,
                attribution: '© OpenWeatherMap'
            });
        }

        // Add layer if not exists
        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'raster',
                source: sourceId,
                paint: { 'raster-opacity': 0.85 },
                layout: { visibility: activeLayers.includes(layer.id) ? 'visible' : 'none' }
            });
        }
    });

    console.log('🌧️ Weather layers re-added!');
}



// Create Popup Content
function createPopupContent(name, waterLevel, risk) {
    const riskColors = { HIGH: '#EF4444', MED: '#F59E0B', LOW: '#22C55E' };
    const riskLabels = { HIGH: 'สูง', MED: 'ปานกลาง', LOW: 'ต่ำ' };
    const color = riskColors[risk] || riskColors.LOW;
    const label = riskLabels[risk] || riskLabels.LOW;

    return `
        <div class="map-popup">
            <div class="popup-header">
                <span class="popup-icon" style="background: ${color}"></span>
                <strong>${name}</strong>
            </div>
            <div class="popup-stats">
                <div class="popup-stat">
                    <span class="stat-label">ระดับน้ำ</span>
                    <span class="stat-value">${waterLevel.toFixed(2)} m</span>
                </div>
                <div class="popup-stat">
                    <span class="stat-label">ความเสี่ยง</span>
                    <span class="stat-value" style="color: ${color}">${label}</span>
                </div>
            </div>
        </div>
    `;
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
