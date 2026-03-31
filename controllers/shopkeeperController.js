const Shop = require('../models/Shop');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
    try {
        const shop = await Shop.findById(req.user.id);
        const orders = await Order.find({ shopId: req.user.id })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.render('shopkeeper/dashboard', { 
            shop, 
            orders, 
            userId: req.user.id,
            vapidPublicKey: process.env.VAPID_PUBLIC_KEY
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addService = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        await Shop.findByIdAndUpdate(req.user.id, {
            $push: { services: { name, description, price } }
        });
        res.redirect('/shopkeeper/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        await Shop.findByIdAndUpdate(req.user.id, {
            $pull: { services: { _id: serviceId } }
        });
        res.redirect('/shopkeeper/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        await Order.findByIdAndUpdate(orderId, { status });
        
        // FUTURE: Here we can trigger Nodemailer / WhatsApp notifications
        // informing the customer that their order was accepted/completed.
        
        res.redirect('/shopkeeper/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
