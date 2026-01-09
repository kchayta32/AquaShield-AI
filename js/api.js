// API Handling Logic

// Initialize Supabase
const db = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// Data State
let realTimeRainfall = 0;
let forecastData = [];

// Fetch External Data
async function fetchExternalData(onUpdateChart) {
    try {
        // Fetch OpenWeatherMap (Current)
        const owmRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${CONFIG.LAT}&lon=${CONFIG.LON}&appid=${CONFIG.OWM_KEY}`);
        if (!owmRes.ok) throw new Error(`OWM Error: ${owmRes.status}`);
        const owmData = await owmRes.json();

        // OWM rain is usually in 'rain.1h'
        if (owmData.rain && owmData.rain['1h']) {
            realTimeRainfall = owmData.rain['1h'];
        } else {
            realTimeRainfall = 0; // No rain
        }

        // Fetch Tomorrow.io (Forecast)
        const tmrRes = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${CONFIG.LAT},${CONFIG.LON}&apikey=${CONFIG.TOMORROW_KEY}`);
        if (!tmrRes.ok) throw new Error(`Tomorrow.io Error: ${tmrRes.status}`);
        const tmrData = await tmrRes.json();

        if (tmrData.timelines && tmrData.timelines.hourly) {
            // Extract next 12 hours of precipitation probability/intensity
            forecastData = tmrData.timelines.hourly.slice(0, 12).map(h => h.values.precipitationProbability || 0);
            if (onUpdateChart) onUpdateChart(forecastData);
        } else {
            throw new Error("Tomorrow.io Data Missing");
        }

        // Log to Supabase for audit (Safe)
        try {
            const { error } = await db.from('api_logs').insert([
                { source: 'OpenWeatherMap', data: { rainfall: realTimeRainfall } },
                { source: 'Tomorrow.io', data: { forecast_points: forecastData.length } }
            ]);
            if (error) console.warn("Supabase Log Error (Table missing?):", error.message);
        } catch (dbErr) {
            console.warn("Supabase connection failed:", dbErr);
        }

    } catch (err) {
        console.error("API Fetch Error:", err);
        // Fallback to simulation if offline
        realTimeRainfall = Math.random() * 5;

        // Update UI for Error State
        const rainEl = document.getElementById('apiRainfall');
        if (rainEl) {
            rainEl.textContent = 'Offline (Sim)';
            rainEl.className = 'text-lg font-semibold text-gray-500';
        }
    }
}

// Save IoT Sensor Data to Supabase
async function saveSensorReading(reading) {
    if (!db) return; // Skip if DB not initialized

    try {
        const { error } = await db.from('sensor_readings').insert([reading]);
        if (error) {
            // Suppress 404/400 errors for prototype to keep console clean
            // console.warn("DB Save Error:", error.message); 
        }
    } catch (err) {
        // console.warn("DB Connection Error:", err);
    }
}
