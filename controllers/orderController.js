const Order = require('../models/Order');
const Shop = require('../models/Shop');
const User = require('../models/User');
const nodemailer = require('nodemailer');

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
        const { shopId, items, paymentMethod } = req.body;
        const userId = req.user.id;

        // Process items from the form data structure
        // The data comes in as items[serviceId][quantity]...
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
            paymentMethod: paymentMethod || 'cod'
        });

        await newOrder.save();

        // Push to relative user arrays (optional depending on MongoDB structure)
        await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });
        await Shop.findByIdAndUpdate(shopId, { $push: { orders: newOrder._id } });

        // Simulate Nodemailer sending an Email to Shopkeeper
        const shop = await Shop.findById(shopId);
        console.log(`[SIMULATED EMAIL TO ${shop.email}] You have a new order: #${newOrder._id} for ₹${totalAmount}. Method: ${paymentMethod}`);

        res.render('customer/orderSuccess', { 
            orderId: newOrder._id, 
            total: totalAmount, 
            paymentMethod,
            shopPhone: shop.phone
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during order creation');
    }
};
