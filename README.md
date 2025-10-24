🌎 The Terrestrial & Celestial Nexus Dashboard

1. Project Overview: The All-In-One Environmental Monitor

The Terrestrial & Celestial Nexus is a real-time, cross-domain monitoring system designed to provide a unified view of every major force impacting daily life—from hyperlocal weather and air quality to global geological and space events.

This system moves beyond conventional weather reporting by integrating atmospheric, hydrological, geological, and astronomical data from over five distinct APIs and libraries into one cohesive, interactive interface. The goal is to provide unparalleled situational awareness for both immediate environmental safety and long-term planetary insight.

2. Core Dashboard Features

The dashboard is organized into interactive panels, ensuring a logical flow from local, personal data to global and celestial dynamics.

☀️ Local & Atmospheric Conditions

This section focuses on data essential for daily planning and immediate safety.

Feature

Data Source(s)

Functionality

Time & Day/Night Progress

Internal Clock & SunCalc

Displays the unique local time and a visual progress bar indicating the fraction of daylight remaining, providing immediate context for the diurnal cycle.

5-Day Weather Forecast

OpenWeatherMap

Standard multi-day forecast.

Enriched Environmental Data

OWM and Visual Crossing

Displays standard OWM elements alongside critical, synthesized metrics: Total Daily Rainfall and Daily Solar Radiation.

Full AQI Data & Forecast

Dedicated AQI API

Comprehensive Air Quality Index data, including pollutant levels and a forecast graph of expected air quality changes.

NWS Weather Alerts

NWS (National Weather Service)

Real-time severe weather alerts (e.g., flood, severe weather, heat) geographically tailored to the user's location.

CME Event Tracker

NOAA/NASA (Space Weather)

Tracks current and forecast Coronal Mass Ejection (CME) events from the Sun, alerting users to potential space weather impacts on technology and infrastructure.

🌕 Celestial and Astronomical Data

This advanced panel provides real-time orbital and positional data for both the Moon and the entire Solar System.

Moon Phase and Age: Displays the current phase, illumination percentage, and the exact age of the moon (days since new moon) using the SunCalc library.

Real-Time Moon Position: Plots the Moon's exact position across the local sky, with positional updates occurring every minute for precise tracking.

Solar System and Sun Plot: A real-time, dynamic 2D visualization that accurately plots the geometric location of the Sun and all major planets in real time, leveraging astronomical ephemeris data.

🏞️ Terrestrial & Geological Reporting

This section integrates critical Earth monitoring systems that detail geological activity, water resources, and environmental hazards.

Hydrological Monitoring (USGS): Live data on local River Flow, Flood Status, Water Temperature, and Conductance for nearby streams and rivers.

Earthquake Mapper (USGS): Displays the current count of global earthquakes. This element is clickable, opening an interactive map for detailed visualization of recent epicenters, magnitudes, and depth.

Contaminated Sites Mapper: Dedicated interactive map and query interface for local and regional environmental hazard sites.

Satellite Tracker: Displays the real-time orbital path and location of tracked satellites on a map. Includes robust search, sorting, and click-to-view functionality for full information profiles.

3. Technical Stack & Data Synthesis

The system's innovation lies in its capacity for high-volume, asynchronous data integration.

Front-end: Built as a single-page application using vanilla JavaScript, HTML5, and Tailwind CSS for cross-device responsiveness.

Core Libraries: The SunCalc library is foundational for all celestial position and phase calculations.

Multi-API Reconciliation: The dashboard successfully reconciles disparate data formats from multiple sources (OWM, Visual Crossing, NWS, USGS, Space Weather APIs), ensuring data freshness and consistency across the entire system.

Real-time Updates: Key elements, such as the Moon's position and planetary plots, are calculated and updated every minute, providing a truly live experience.

4. Setup and Run Instructions

The dashboard requires a modern web browser to execute the client-side JavaScript that handles all API communication and rendering.

Dependencies: Ensure all required libraries (SunCalc, mapping libraries, etc.) are loaded via their respective CDNs as configured in the main HTML file.

API Keys: Configure the required API keys (OpenWeatherMap, Visual Crossing, etc.) in the designated areas of the JavaScript.

Launch: Simply open the index.html file in any modern web browser.

Note: Due to the scope of external API calls, optimal performance is achieved when running through a local development server.
