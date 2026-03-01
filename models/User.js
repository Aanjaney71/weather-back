const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true },
    name: { type: String },
    preferences: {
        unit: { type: String, enum: ['C', 'F'], default: 'C' },
        theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
        performanceMode: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
