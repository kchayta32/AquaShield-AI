// Main Application Logic

let currentWaterLevel = 2.5; // Sync with AI base level
let mapInitialized = false;

// 1. Initialize AI Model
const ai = new HydrologicalAI(0.9, 2.5); // k=0.9 (Slow decay), Base=2.5m

function initApp() {
    updateTime();
    generateForecastChart();

    // Start Loops
    simulateData();

    // API Fetch Loop
    setInterval(() => fetchExternalData(updateChartWithApiData), 300000); // 5 mins
    fetchExternalData(updateChartWithApiData); // Initial call

    // Initialize Map explicitly if not done
    if (!mapInitialized) {
        setTimeout(() => {
            initMap();
            mapInitialized = true;
        }, 500);
    }
}

// Simulation Loop (Visuals + AI Logic)
function simulateData() {
    setInterval(() => {
        // Use Real Rainfall as target (from api.js global), fluctuate slightly
        const displayRain = Math.max(0, realTimeRainfall + (Math.random() - 0.5));

        // --- AI Model Update ---
        // Verify realTimeRainfall exists, else 0
        const currentRain = realTimeRainfall || 0;

        // Update Model
        const result = ai.update(currentRain);

        // Update Global State for UI
        currentWaterLevel = result.waterLevel; // Sync for other components if needed

        // Update UI Elements
        const rainEl = document.getElementById('rainfallValue');
        const waterEl = document.getElementById('waterLevel');

        if (rainEl) rainEl.textContent = displayRain.toFixed(1) + ' mm';
        if (waterEl) waterEl.textContent = result.waterLevel.toFixed(2) + ' m';

        // Risk Logic (From Model)
        const riskEl = document.getElementById('riskLevel');
        if (riskEl) {
            riskEl.textContent = result.risk.label;
            riskEl.className = `text-3xl font-bold mb-1 ${result.risk.class}`;
        }

        // Update Prediction Text
        const predEl = document.getElementById('predictedWater');
        if (predEl) predEl.textContent = `Sat: ${result.soilSaturation}% (API: ${result.apiIndex})`;

        // Update Map Markers (Dynamic) - Safety Check
        if (typeof window.updateMapMarkers === 'function') {
            window.updateMapMarkers(result);
        }

        // --- IoT Push Simulation ---
        // Push data to DB every ~10 seconds (Simulating sensor)
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

// Global Time Interval
setInterval(updateTime, 60000);

// Initial Call to setup time immediately
updateTime();
