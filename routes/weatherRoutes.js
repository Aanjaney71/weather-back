const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');

// GET /api/v1/weather/:city
router.get('/:city', getWeather);

module.exports = router;
