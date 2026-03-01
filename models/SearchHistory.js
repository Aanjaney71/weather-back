const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, required: true },
    country: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

SearchHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
