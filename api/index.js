const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Full CORS support — allow all origins and handle preflight
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle OPTIONS preflight for all routes

// Root
app.get('/', (req, res) => {
    res.json({ name: 'AtmosSphere Weather API', status: 'online', endpoints: ['/api/v1/health', '/api/v1/weather/:city'] });
});

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Weather — fetches directly from OpenWeatherMap, no DB needed
app.get('/api/v1/weather/:city', async (req, res) => {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    try {
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
        ]);
        res.json({ source: 'api', current: currentRes.data, forecast: forecastRes.data });
    } catch (error) {
        const status = error.response?.status === 404 ? 404 : 500;
        const message = error.response?.status === 404 ? 'City not found. Please try another.' : 'Failed to fetch weather data';
        res.status(status).json({ success: false, error: message });
    }
});

module.exports = app;
