const SavedCity = require('../models/SavedCity');
const SearchHistory = require('../models/SearchHistory');
const User = require('../models/User');

// Normally, req.user would be populated by a auth middleware
// For this scaffolding, we'll assume the user ID is sent in headers or body

exports.saveCity = async (req, res) => {
    try {
        const { userId, city, country, lat, lon } = req.body;

        if (!userId || !city) return res.status(400).json({ message: 'Missing user or city' });

        const newCity = await SavedCity.findOneAndUpdate(
            { userId, city: city.toLowerCase() },
            { userId, city: city.toLowerCase(), country, lat, lon, addedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, data: newCity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeCity = async (req, res) => {
    try {
        const { userId, city } = req.body;
        await SavedCity.findOneAndDelete({ userId, city: city.toLowerCase() });
        res.status(200).json({ success: true, message: 'City removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSavedCities = async (req, res) => {
    try {
        const { userId } = req.params;
        const cities = await SavedCity.find({ userId }).sort({ addedAt: -1 });
        res.status(200).json({ success: true, data: cities });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addSearchHistory = async (req, res) => {
    try {
        const { userId, city, country, lat, lon } = req.body;
        if (!userId || !city) return res.status(400).json({ message: 'Missing userId or city' });

        const history = new SearchHistory({
            userId,
            city: city.toLowerCase(),
            country,
            lat,
            lon
        });
        await history.save();

        res.status(201).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSearchHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await SearchHistory.find({ userId }).sort({ timestamp: -1 }).limit(10);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
