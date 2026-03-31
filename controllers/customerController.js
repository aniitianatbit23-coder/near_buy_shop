const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        let nearbyShops = [];
        let queryMode = 'all';

        // Fetch shops near user using MongoDB $near if user has a location
        if (user.location && user.location.coordinates[0] !== 0) {
            nearbyShops = await Shop.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: user.location.coordinates // [lng, lat]
                        },
                        $maxDistance: 10000 // Within 10 kilometers
                    }
                }
            });
            queryMode = 'nearby';
        } else {
            // Fallback: fetch random shops if no location
            nearbyShops = await Shop.find().limit(10);
        }

        // Fetch User's Orders
        const orders = await Order.find({ userId: req.user.id })
            .populate('shopId', 'shopName')
            .sort({ createdAt: -1 });

        res.render('customer/dashboard', { 
            user, 
            shops: nearbyShops,
            orders: orders || [],
            queryMode
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getShopDetails = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).send('Shop not found');
        
        res.render('customer/shop', { shop });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
