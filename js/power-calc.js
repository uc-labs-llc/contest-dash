// js/power-calc.js

// Constants for Power Calculation
const CALC_G_STC = 1000;
const CALC_PERFORMANCE_RATIO = 0.8;

// --- Core Calculation Functions ---
function solarCalcInstantaneousPower(date, lat, lon, totalRatedWatts) {
    // Requires SunCalc to be loaded
    const sunPos = SunCalc.getPosition(date, lat, lon);
    const solarAltitudeRad = sunPos.altitude; 
    const G_actual = CALC_G_STC * Math.max(0, Math.sin(solarAltitudeRad));
    const expectedPower = totalRatedWatts * (G_actual / CALC_G_STC) * CALC_PERFORMANCE_RATIO;
    return { power: Math.max(0, expectedPower), radiation: G_actual };
}

function solarCalcOptimalAngle(lat) {
    const tilt = Math.abs(lat);
    const direction = lat >= 0 ? 'True South (180°)' : 'True North (0°)';
    return { tilt: tilt.toFixed(1), direction: direction };
}

// --- Main Update Function for Power and Angle ---
function updateSolarPower() {
    // Reading values from updated DOM IDs
    const numPanels = parseFloat(document.getElementById('calc-panels').value || 0);
    const panelWatts = parseFloat(document.getElementById('calc-watts').value || 0);
    const lat = parseFloat(document.getElementById('calc-latitude').value || 0);
    const lon = parseFloat(document.getElementById('calc-longitude').value || 0);
    const totalRatedWatts = numPanels * panelWatts;
    const now = new Date();

    if (totalRatedWatts <= 0 || isNaN(lat) || isNaN(lon) || !lat || !lon) {
        document.getElementById('calculated-currentPower').textContent = '-- W';
        document.getElementById('calculated-bestAngle').textContent = '-- °';
        return;
    }

    const { power: currentPower } = solarCalcInstantaneousPower(now, lat, lon, totalRatedWatts);
    const { tilt: optimalTilt, direction } = solarCalcOptimalAngle(lat);

    // Update DOM
    document.getElementById('calculated-currentPower').textContent = `${currentPower.toFixed(0)} W`;
    document.getElementById('calculated-bestAngle').textContent = `${optimalTilt}° (facing ${direction})`;
}

// Initialize and Listen when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    updateSolarPower();
    
    // Set an interval for constant updates (1 minute)
    setInterval(updateSolarPower, 60000);
    
    // Listen for any input change
    document.getElementById('solarCalcForm').addEventListener('input', updateSolarPower);
});
