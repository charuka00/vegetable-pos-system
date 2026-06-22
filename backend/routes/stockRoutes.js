const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Endpoints mapping
router.post('/morning', stockController.saveMorningStock);
router.post('/evening', stockController.saveEveningStock);
router.get('/:date', stockController.getStockByDate);

module.exports = router;