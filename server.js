const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Explicit CORS config to allow the deployed frontend + local dev
app.use(cors({
    origin: [
        'https://weather-web-peach-one.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Handle preflight requests
app.options('*', cors());

app.use(helmet());
app.use(morgan('dev'));

// Routes
const weatherRoutes = require('./routes/weatherRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/users', userRoutes);

// Basic health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Add a root route so visiting the Vercel app URL returns a friendly message
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'AtmosSphere Weather API',
        status: 'online',
        endpoints: [
            '/api/v1/health',
            '/api/v1/weather/:city'
        ]
    });
});

// Fallback for just /api/v1/weather
app.get('/api/v1/weather', (req, res) => {
    res.status(400).json({
        error: 'Missing city parameter. Usage: /api/v1/weather/:city'
    });
});


// Only listen when running locally (not on Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;
