class NWSAlert {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            state: 'TX', // Texas
            refreshInterval: options.refreshInterval || 300000, // 5 minutes
            maxAlerts: options.maxAlerts || 4,
            ...options
        };

        if (!this.container) {
            console.error('NWS Alert: Container element not found');
            return;
        }

        this.displayPlaceholder();
        this.initialize();
    }

    async initialize() {
        await this.fetchAndDisplayAlerts();
        this.setupAutoRefresh();
    }

    async fetchAndDisplayAlerts() {
        try {
            this.container.innerHTML = '<div class="nws-alert updating">Fetching weather alerts...</div>';
            const alerts = await this.getAlerts();
            this.renderAlerts(alerts);
        } catch (error) {
            console.error('NWS Alert: Error fetching alerts', error);
            this.displayError('Unable to load weather alerts for Texas');
        }
    }

    async getAlerts() {
        const url = `https://api.weather.gov/alerts/active?area=${this.options.state}`;
        
        const response = await fetch(url, {
            headers: {
                // Use a descriptive User-Agent, required by NWS
                'User-Agent': '(your-website.com, contact@email.com)', 
                'Accept': 'application/geo+json'
            }
        });

        if (!response.ok) throw new Error(`API request failed with status: ${response.status}`);
        
        const data = await response.json();
        return data.features || [];
    }

    renderAlerts(alerts) {
        this.container.innerHTML = '';
        const alertsToDisplay = alerts.slice(0, this.options.maxAlerts);

        if (alertsToDisplay.length === 0) {
            this.displayError('No active weather alerts for Texas.');
            return;
        }

        alertsToDisplay.forEach(feature => {
            const properties = feature.properties;
            const alertElement = this.createAlert(
                properties.event, 
                properties.severity, 
                properties.instruction,
                // Pass both full description and areaDesc
                properties.description, 
                properties.expires,
                properties.areaDesc 
            );
            this.container.appendChild(alertElement);
        });
    }

    createAlert(event, severity, instruction, description, expires, areaDesc) {
        const TRUNCATION_LIMIT = 105;
        const cssSeverity = severity.toLowerCase();
        const displaySeverity = severity.toUpperCase();
        
        // Truncate the description for the main visible panel
        const truncatedDescription = this.truncateText(description, TRUNCATION_LIMIT);
        
        // Prepare the full description for display in the tooltip
        // Replace newlines with <br> for proper HTML formatting
        const fullDescriptionHTML = description ? description.replace(/\n/g, '<br>') : 'No details available.';
        
        // Format expiration time
        const timeOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' };
        let timeString = '';
        if (expires) {
            try {
                const expiresDate = new Date(expires);
                timeString = `Expires: ${expiresDate.toLocaleString('en-US', timeOptions)}`;
            } catch {
                // Handle invalid date string if necessary
            }
        }

        const alertDiv = document.createElement('div');
        // Add 'has-tooltip' class to make the alert the positioning context for the tooltip
        alertDiv.className = `nws-alert ${cssSeverity} has-tooltip`; 
        
        alertDiv.innerHTML = `
            <div class="nws-alert-header">
                <div class="nws-alert-title">${event}</div>
                <div class="nws-alert-severity">${displaySeverity}</div>
            </div>
            
            <div class="nws-alert-desc-truncated">${truncatedDescription}</div>
            
            <div class="nws-alert-tooltip">
                <div class="nws-alert-tooltip-title">${event} Details (${areaDesc})</div>
                <div class="nws-alert-tooltip-content">${fullDescriptionHTML}</div>
            </div>

            ${instruction ? `<div class="nws-alert-instructions">${this.truncateText(instruction, TRUNCATION_LIMIT)}</div>` : ''}
            ${timeString ? `<div class="nws-alert-time">${timeString}</div>` : ''}
        `;
        return alertDiv;
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    displayPlaceholder() {
        this.container.innerHTML = `
            <div class="nws-alert-header">
                <h3>Texas Weather Alerts</h3>
            </div>
            <div class="nws-alert advisory">Loading alerts...</div>
        `;
    }
    
    displayError(message) {
        this.container.innerHTML = `
            <div class="nws-alert-header">
                <h3>Texas Weather Alerts</h3>
            </div>
            <div class="nws-alert advisory">${message}</div>
        `;
    }

    setupAutoRefresh() {
        setInterval(() => this.fetchAndDisplayAlerts(), this.options.refreshInterval);
    }

    refresh() {
        this.fetchAndDisplayAlerts();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // This assumes your container has the ID 'nws-alert-container'
    window.texasAlerts = new NWSAlert('nws-alert-container', {
        maxAlerts: 4
    });
});
