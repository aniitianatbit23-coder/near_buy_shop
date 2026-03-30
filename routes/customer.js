const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { isAuthenticated, isRole } = require('../middleware/auth');

router.use(isAuthenticated, isRole('customer'));

router.get('/dashboard', customerController.getDashboard);
router.get('/shop/:id', customerController.getShopDetails);

module.exports = router;
