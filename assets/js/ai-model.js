/**
 * AquaShield AI - Hydrological Model
 * Uses Antecedent Precipitation Index (API) to simulate soil saturation and runoff.
 * 
 * Logic:
 * Soil remembers past rainfall. Wet soil produces more runoff (floods faster).
 * API_t = P_t + (k * API_{t-1})
 */

class HydrologicalAI {
    constructor(kFactor = 0.90, baseWaterLevel = 2.5) {
        this.k = kFactor; // Decay constant (0.85 - 0.98)
        this.baseLevel = baseWaterLevel;
        this.apiIndex = 0; // Current soil moisture memory (mm)
        this.currentWater = baseWaterLevel;
    }

    /**
     * Update model with new rainfall data
     * @param {number} rainfall - Current rainfall in mm
     * @returns {object} - Calculated values
     */
    update(rainfall) {
        // 1. Update Soil Memory (API)
        // New moisture = Current Rain + (Retained Old Moisture)
        this.apiIndex = rainfall + (this.k * this.apiIndex);

        // 2. Calculate Runoff Factor based on Saturation
        // If API > 100mm, soil is saturated -> High Runoff
        // Sigmoid curve for realistic saturation
        const saturation = 1 / (1 + Math.exp(-(this.apiIndex - 50) / 10));

        // 3. Water Level Response
        // Water rises based on (Runoff * Rain) + Saturated Base Flow
        const rise = (rainfall * 0.02) + (saturation * 0.05 * this.apiIndex);

        // 4. Natural Drainage (Water flows out)
        const drainage = (this.currentWater - this.baseLevel) * 0.05;

        // Apply changes
        this.currentWater += rise - drainage;

        // Add some noise for realism
        this.currentWater += (Math.random() - 0.5) * 0.01;

        // Clamp minimum
        this.currentWater = Math.max(1.0, this.currentWater);

        return {
            waterLevel: this.currentWater,
            soilSaturation: (saturation * 100).toFixed(1), // %
            apiIndex: this.apiIndex.toFixed(1),
            risk: this.calculateRisk(this.currentWater)
        };
    }

    calculateRisk(level) {
        if (level > 4.2) return { level: 'HIGH', label: 'สูง', class: 'text-red-500' };
        if (level > 3.5) return { level: 'MEDIUM', label: 'ปานกลาง', class: 'text-yellow-500' };
        return { level: 'LOW', label: 'ต่ำ', class: 'text-green-500' };
    }

    // Load past state (e.g., from DB)
    loadState(savedApiIndex, savedWaterLevel) {
        this.apiIndex = savedApiIndex || 0;
        this.currentWater = savedWaterLevel || this.baseLevel;
    }
}
