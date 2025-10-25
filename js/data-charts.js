// js/data-charts.js

// Chart instances (local to this file)
let solarLineChartInstance = null;
let solarBarChartInstance = null;

// --- Solar Radiation Class ---
class SolarRadiationData {
    constructor() {
        // Updated DOM IDs from the solar-calc.html structure
        this.solarLocationDisplay = document.getElementById('solar-location-display');
        this.solarCurrentRadiationElement = document.getElementById('current-radiation-display');
        this.solarUpdateStatusElement = document.getElementById('app-status');
        this.solarLastUpdatedElement = document.getElementById('last-updated-time');

        this.solarLocationDisplay.textContent = GLOBAL_LOCATION;
        this.solarFetchWeatherData();
        setInterval(() => this.solarFetchWeatherData(), 10 * 60 * 1000); 
    }

    async solarFetchWeatherData() {
        this.solarUpdateStatusElement.textContent = 'Fetching hourly forecast...';
        
        try {
            const solarUrl = `${GLOBAL_API_URL}${encodeURIComponent(GLOBAL_LOCATION)}/today?key=${GLOBAL_API_KEY}&include=days,hours,current&unitGroup=us&contentType=json`;
            const solarResponse = await fetch(solarUrl);
            
            if (!solarResponse.ok) {
                throw new Error(`Visual Crossing API error: ${solarResponse.status}`);
            }
            
            const solarData = await solarResponse.json();
            
            this.solarUpdateCurrentValue(solarData);
            this.solarRenderCharts(solarData);
            this.solarUpdateLastUpdated();
            
        } catch (error) {
            console.error('Error fetching solar radiation data:', error);
            this.solarShowErrors(error.message);
        }
    }

    solarUpdateCurrentValue(solarData) {
        if (solarData.currentConditions && solarData.currentConditions.solarradiation !== undefined) {
            const solarRadiation = solarData.currentConditions.solarradiation;
            this.solarCurrentRadiationElement.textContent = `${solarRadiation.toFixed(0)} W/m²`;
        } else {
            this.solarCurrentRadiationElement.textContent = '-- W/m²';
        }
    }

    /**
     * Extracts hourly timestamps and CALCULATES the power (Watts) for each hour.
     */
    solarExtractHourlyData(solarData) {
        const solarHourlyData = [];
        const solarNow = moment();
        
        // Retrieve system configuration from input fields
        const numPanels = parseFloat(document.getElementById('calc-panels').value || 0);
        const panelWatts = parseFloat(document.getElementById('calc-watts').value || 0);
        const lat = parseFloat(document.getElementById('calc-latitude').value || 0);
        const lon = parseFloat(document.getElementById('calc-longitude').value || 0);
        const totalRatedWatts = numPanels * panelWatts;

        if (solarData.days && solarData.days.length > 0 && solarData.days[0].hours) {
            
            solarData.days[0].hours.forEach(solarHour => {
                const solarTime = moment(solarHour.datetimeEpoch * 1000);
                
                let powerValue = 0;
                // Check if the calculation function from power-calc.js is available
                if (window.solarCalcInstantaneousPower) {
                    const { power } = window.solarCalcInstantaneousPower(
                        solarTime.toDate(), 
                        lat, 
                        lon, 
                        totalRatedWatts
                    );
                    powerValue = power;
                }
                
                solarHourlyData.push({
                    time: solarTime.format('h A'),
                    value: powerValue, // Value is now the calculated power in Watts
                    isCurrentHour: solarTime.isSame(solarNow, 'hour')
                });
            });
        }
        return solarHourlyData;
    }
    
    solarRenderCharts(solarData) {
        const solarHourlyData = this.solarExtractHourlyData(solarData);
        const solarLabels = solarHourlyData.map(d => d.time);
        const solarValues = solarHourlyData.map(d => d.value);

        this.solarRenderBarChart(solarLabels, solarValues, solarHourlyData);
        this.solarRenderLineChart(solarLabels, solarValues, solarHourlyData);
    }

    // Renders the Line Chart (Progression of POWER)
    solarRenderLineChart(solarLabels, solarValues, solarHourlyData) {
        const solarPointBackgroundColors = solarHourlyData.map(d => d.isCurrentHour ? '#3498db' : 'rgba(243, 156, 18, 1)');
        const solarPointBorderColors = solarHourlyData.map(d => d.isCurrentHour ? '#ffffff' : '#f39c12');
        const solarPointRadii = solarHourlyData.map(d => d.isCurrentHour ? 6 : 4);
        
        const solarCtx = document.getElementById('line-chart').getContext('2d');

        if (solarLineChartInstance) {
            solarLineChartInstance.destroy();
        }

        solarLineChartInstance = new Chart(solarCtx, {
            type: 'line', 
            data: {
                labels: solarLabels,
                datasets: [{
                    label: 'Calculated Power (W)',
                    data: solarValues,
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    borderColor: '#f39c12',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: solarPointBackgroundColors,
                    pointBorderColor: solarPointBorderColors,
                    pointRadius: solarPointRadii,
                    pointHoverRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Power: ${context.parsed.y.toFixed(0)} W`
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time of Day', color: '#ccc' },
                        ticks: { 
                            color: '#bbb',
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                            callback: function(value, index, values) {
                                return index % 4 === 0 ? this.getLabelForValue(value) : '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Power (W)', color: '#ccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#bbb', beginAtZero: true }
                    }
                }
            }
        });
    }
    
    // Renders the Bar Chart (Magnitude of POWER)
    solarRenderBarChart(solarLabels, solarValues, solarHourlyData) {
        const solarBackgroundColors = solarHourlyData.map(d => d.isCurrentHour ? '#3498db' : 'rgba(243, 156, 18, 0.8)');
        const solarBorderColors = solarHourlyData.map(d => d.isCurrentHour ? '#ffffff' : '#f39c12');

        const solarCtx = document.getElementById('bar-chart').getContext('2d');

        if (solarBarChartInstance) {
            solarBarChartInstance.destroy();
        }

        solarBarChartInstance = new Chart(solarCtx, {
            type: 'bar', 
            data: {
                labels: solarLabels,
                datasets: [{
                    label: 'Calculated Power (W)',
                    data: solarValues,
                    backgroundColor: solarBackgroundColors,
                    borderColor: solarBorderColors,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Power: ${context.parsed.y.toFixed(0)} W`
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time of Day', color: '#ccc' },
                        ticks: { 
                            color: '#bbb',
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                            callback: function(value, index, values) {
                                return index % 4 === 0 ? this.getLabelForValue(value) : '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Power (W)', color: '#ccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#bbb', beginAtZero: true }
                    }
                }
            }
        });
    }

    solarUpdateLastUpdated() {
        this.solarLastUpdatedElement.textContent = `Last updated: ${moment().format('MMM D, h:mm:ss A')}`;
    }

    solarShowErrors(solarMessage) {
        this.solarCurrentRadiationElement.textContent = 'Error';
        this.solarCurrentRadiationElement.classList.add('solar-error');
        this.solarUpdateStatusElement.textContent = `Error: ${solarMessage}`;
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    new SolarRadiationData();
});
