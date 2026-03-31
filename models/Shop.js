const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String, default: '/images/default-service.png' }
});

const shopSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'shopkeeper' },
    
    shopName: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true }, // e.g., Grocery, Plumber, Electronics
    image: { type: String, default: '/images/default-shop.png' },
    
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        },
        address: String
    },
    
    services: [serviceSchema],
    
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    pushSubscription: { type: Object } // Added for mobile notifications
}, { timestamps: true });

// Extremely important for `$near` geospatial queries
shopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);
