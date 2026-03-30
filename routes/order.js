const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAuthenticated, isRole } = require('../middleware/auth');

router.post('/create', isAuthenticated, isRole('customer'), orderController.createOrder);

module.exports = router;
