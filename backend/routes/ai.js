const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInsight, searchExpenses, parseExpense } = require('../controllers/aiController');

router.post('/insight', auth, getInsight);
router.post('/search', auth, searchExpenses);
router.post('/parse', auth, parseExpense);

module.exports = router;
