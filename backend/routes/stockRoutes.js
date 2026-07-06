const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.post('/morning', stockController.saveMorningStock);
router.post('/evening', stockController.saveEveningStock);
router.get('/monthly/:yearMonth', stockController.getMonthlyReport); // 👈 මේක අනිවාර්යයෙන්ම දාන්න
router.get('/:date', stockController.getStockByDate);

module.exports = router;