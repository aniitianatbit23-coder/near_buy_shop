const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'customer' },
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
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    pushSubscription: { type: Object } // Added for mobile notifications
}, { timestamps: true });

// Index for getting users by location if needed, though usually we query shops by location
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
