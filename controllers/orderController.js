const Order = require('../models/Order');
const Shop = require('../models/Shop');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const webpush = require('web-push');

// Set up Nodemailer transporter (Mock for now, logging to console)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER || 'mock@example.com',
        pass: process.env.EMAIL_PASS || 'mockpass'
    }
});

exports.createOrder = async (req, res) => {
    try {
        const { shopId, items, paymentMethod, deliveryAddress } = req.body;
        const userId = req.user.id;

        // Process items from the form data structure
        const processedItems = [];
        let totalAmount = 0;

        if (items) {
            for (const [id, itemDetails] of Object.entries(items)) {
                if (parseInt(itemDetails.quantity) > 0) {
                    const price = parseFloat(itemDetails.price);
                    const quantity = parseInt(itemDetails.quantity);
                    processedItems.push({
                        serviceId: id,
                        name: itemDetails.name,
                        price: price,
                        quantity: quantity
                    });
                    totalAmount += (price * quantity);
                }
            }
        }

        if (processedItems.length === 0) {
            return res.status(400).send('No items selected');
        }

        const newOrder = new Order({
            userId,
            shopId,
            items: processedItems,
            totalAmount,
            paymentMethod: paymentMethod || 'cod',
            deliveryAddress,
            otp: Math.floor(100000 + Math.random() * 900000).toString() // Generate 6-digit OTP
        });

        await newOrder.save();

        // Update counts
        const customer = await User.findById(userId);
        await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });
        const shop = await Shop.findByIdAndUpdate(shopId, { $push: { orders: newOrder._id } });

        // --- NOTIFICATIONS ---
        const customerName = customer ? customer.name : 'A customer';
        
        // 1. Real-time Socket.io notification
        const io = req.app.get('socketio');
        const connectedUsers = req.app.get('connectedUsers');
        const shopSocketId = connectedUsers.get(shopId.toString());
        
        if (shopSocketId) {
            io.to(shopSocketId).emit('newOrder', {
                orderId: newOrder._id,
                total: totalAmount,
                customer: customerName
            });
        }

        // 2. Web Push Notification (Mobile/Background)
        if (shop.pushSubscription) {
            const payload = JSON.stringify({
                title: 'New Order Received! 🛍️',
                body: `${customerName} just ordered items worth ₹${totalAmount}. OTP: ${newOrder.otp}`,
                icon: '/images/logo.png',
                url: '/shopkeeper/dashboard'
            });
            webpush.sendNotification(shop.pushSubscription, payload)
                .catch(err => console.error('Push notification error:', err));
        }

        // 3. Simulated Email
        console.log(`[SIMULATED EMAIL TO ${shop.email}] You have a new order: #${newOrder._id} for ₹${totalAmount}. Method: ${paymentMethod}. OTP: ${newOrder.otp}`);

        res.render('customer/orderSuccess', { 
            orderId: newOrder._id, 
            total: totalAmount, 
            paymentMethod,
            shopPhone: shop.phone,
            otp: newOrder.otp
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during order creation');
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { otp } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please check with customer.' });
        }

        order.status = 'completed';
        await order.save();

        res.status(200).json({ message: 'Order verified and completed successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Verification failed' });
    }
};
