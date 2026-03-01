const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow all origins CORS
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));

// Routes
const weatherRoutes = require('./routes/weatherRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Root
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'AtmosSphere Weather API',
        status: 'online',
        endpoints: ['/api/v1/health', '/api/v1/weather/:city']
    });
});

// Base weather route
app.get('/api/v1/weather', (req, res) => {
    res.status(400).json({ error: 'Missing city. Usage: /api/v1/weather/:city' });
});

// Only listen locally
if (process.env.NODE_ENV !== 'production') {
    const connectDB = require('./config/db');
    connectDB().catch(err => console.error('DB Error:', err.message));
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
