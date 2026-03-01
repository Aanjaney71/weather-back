const axios = require('axios');

// Try to load WeatherCache — if MongoDB is unavailable, gracefully skip caching
let WeatherCache;
try {
    WeatherCache = require('../models/WeatherCache');
} catch (e) {
    WeatherCache = null;
}

const fetchWeatherData = async (city) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(url),
            axios.get(forecastUrl)
        ]);

        return {
            current: currentRes.data,
            forecast: forecastRes.data
        };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('City not found');
        }
        throw new Error('Failed to fetch weather data');
    }
};

exports.getWeather = async (req, res) => {
    const { city } = req.params;
    const cityKey = city.toLowerCase().trim();

    try {
        // Try cache only if MongoDB is connected
        if (WeatherCache && req.query.fresh !== 'true') {
            try {
                const cachedData = await WeatherCache.findOne({ cityKey });
                if (cachedData && cachedData.expiresAt > new Date()) {
                    return res.status(200).json({
                        source: 'cache',
                        current: cachedData.current,
                        forecast: cachedData.forecast
                    });
                }
            } catch (cacheErr) {
                // Cache lookup failed — just skip it and fetch fresh
                console.warn('Cache lookup failed, fetching fresh:', cacheErr.message);
            }
        }

        // Fetch from OpenWeatherMap API
        const data = await fetchWeatherData(cityKey);

        // Try to save to cache — but don't fail if MongoDB is down
        if (WeatherCache) {
            try {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 1);
                await WeatherCache.findOneAndUpdate(
                    { cityKey },
                    {
                        cityKey,
                        current: data.current,
                        forecast: data.forecast,
                        lat: data.current.coord.lat,
                        lon: data.current.coord.lon,
                        updatedAt: new Date(),
                        expiresAt
                    },
                    { upsert: true, new: true }
                );
            } catch (cacheErr) {
                console.warn('Cache save failed:', cacheErr.message);
            }
        }

        res.status(200).json({ source: 'api', ...data });
    } catch (error) {
        res.status(error.message === 'City not found' ? 404 : 500).json({
            success: false,
            error: error.message
        });
    }
};
