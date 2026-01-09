/**
 * AquaShield AI - Main Application Logic
 * Version 2.0.0
 */

let currentWaterLevel = 2.5;
let mapInitialized = false;

// Initialize AI Model
const ai = new HydrologicalAI(0.9, 2.5);

// Main App Initialization
function initApp() {
    console.log('🌊 AquaShield AI v2.0 - Initializing...');

    updateTime();
    generateForecastChart();

    // Start simulation
    simulateData();

    // API Fetch Loop (every 5 minutes)
    setInterval(() => fetchExternalData(updateChartWithApiData), 300000);
    fetchExternalData(updateChartWithApiData);

    // Initialize Map
    if (!mapInitialized) {
        setTimeout(() => {
            initMap();
            mapInitialized = true;
        }, 500);
    }

    console.log('✅ AquaShield AI Ready!');
}

// Simulation Loop
function simulateData() {
    setInterval(() => {
        const displayRain = Math.max(0, realTimeRainfall + (Math.random() - 0.5));
        const currentRain = realTimeRainfall || 0;

        // Update AI Model
        const result = ai.update(currentRain);
        currentWaterLevel = result.waterLevel;

        // Update UI Elements
        const rainEl = document.getElementById('rainfallValue');
        const waterEl = document.getElementById('waterLevel');

        if (rainEl) rainEl.textContent = displayRain.toFixed(1) + ' mm';
        if (waterEl) waterEl.textContent = result.waterLevel.toFixed(2) + ' m';

        // Update Risk Display
        const riskEl = document.getElementById('riskLevel');
        if (riskEl) {
            riskEl.textContent = result.risk.label;
            // Apply color based on risk level
            if (result.risk.level === 'HIGH') {
                riskEl.style.color = '#EF4444';
            } else if (result.risk.level === 'MEDIUM') {
                riskEl.style.color = '#F59E0B';
            } else {
                riskEl.style.color = '#22C55E';
            }
        }

        // Update Prediction Display
        const predEl = document.getElementById('predictedWater');
        if (predEl) {
            predEl.textContent = `Sat: ${result.soilSaturation}% (API: ${result.apiIndex})`;
        }

        // Update Map Markers
        if (typeof window.updateMapMarkers === 'function') {
            window.updateMapMarkers(result);
        }

        // Simulate IoT Data Push (10% chance each cycle)
        if (Math.random() > 0.90) {
            saveSensorReading({
                rainfall: currentRain,
                water_level: result.waterLevel,
                soil_moisture: parseFloat(result.soilSaturation),
                api_index: parseFloat(result.apiIndex)
            });
        }

    }, 2000);
}

// Time Update Loop
setInterval(updateTime, 60000);
updateTime();

// Auto-init if on dashboard page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on dashboard
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader) {
        initApp();
    }
});
