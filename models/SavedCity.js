const mongoose = require('mongoose');

const SavedCitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, required: true },
    country: { type: String },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    pinned: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now }
});

// Ensure a user can't save the same city multiple times
SavedCitySchema.index({ userId: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('SavedCity', SavedCitySchema);
