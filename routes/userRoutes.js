const express = require('express');
const router = express.Router();
const { saveCity, removeCity, getSavedCities, addSearchHistory, getSearchHistory } = require('../controllers/userController');

// In a real app, protect these with auth middleware representing firebase/stitch tokens
router.post('/saved-cities', saveCity);
router.delete('/saved-cities', removeCity);
router.get('/:userId/saved-cities', getSavedCities);

router.post('/history', addSearchHistory);
router.get('/:userId/history', getSearchHistory);

module.exports = router;
