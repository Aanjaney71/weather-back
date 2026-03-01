const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');

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
        // Check Cache
        const cachedData = await WeatherCache.findOne({ cityKey });

        // If cached within the last hour AND client didn't request fresh data
        if (cachedData && cachedData.expiresAt > new Date() && req.query.fresh !== 'true') {
            return res.status(200).json({
                source: 'cache',
                current: cachedData.current,
                forecast: cachedData.forecast
            });
        }

        // Fetch from API
        const data = await fetchWeatherData(cityKey);

        // Update Cache
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour TTL

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

        res.status(200).json({ source: 'api', ...data });
    } catch (error) {
        res.status(error.message === 'City not found' ? 404 : 500).json({ success: false, error: error.message });
    }
};
