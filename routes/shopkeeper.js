const express = require('express');
const router = express.Router();
const shopkeeperController = require('../controllers/shopkeeperController');
const { isAuthenticated, isRole } = require('../middleware/auth');

router.use(isAuthenticated, isRole('shopkeeper'));

router.get('/dashboard', shopkeeperController.getDashboard);
router.post('/service/add', shopkeeperController.addService);
router.post('/service/:serviceId/delete', shopkeeperController.deleteService);
router.post('/order/:orderId/update', shopkeeperController.updateOrderStatus);

module.exports = router;
