const mongoose = require('mongoose');

const WeatherCacheSchema = new mongoose.Schema({
    cityKey: { type: String, required: true, unique: true }, // e.g., "london,uk"
    lat: { type: Number },
    lon: { type: Number },
    current: { type: Object, required: true },
    forecast: { type: Object },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

// Create TTL index on expiresAt field
WeatherCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('WeatherCache', WeatherCacheSchema);
