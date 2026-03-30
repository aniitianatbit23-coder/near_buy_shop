const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    paymentId: { type: String }, // For Razorpay mock/real order ID
    deliveryAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
