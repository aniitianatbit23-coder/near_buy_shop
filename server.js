const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const User = require('./models/User');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure web-push
webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@nearbuyshop.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Socket.io connection state
const connectedUsers = new Map();

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`User registered for real-time notifications: ${userId}`);
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });
});

// Make io and connectedUsers accessible in controllers
app.set('socketio', io);
app.set('connectedUsers', connectedUsers);

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/near_buy_shop', {
//   useNewUrlParser: true, // Deprecated and no longer needed in newer Mongoose
//   useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount routers
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/customer', require('./routes/customer'));
app.use('/shopkeeper', require('./routes/shopkeeper'));
app.use('/order', require('./routes/order'));

// Push notification subscription route
app.post('/api/notifications/subscribe', async (req, res) => {
    try {
        const { subscription, userId, role } = req.body;
        if (role === 'shopkeeper') {
            await Shop.findByIdAndUpdate(userId, { pushSubscription: subscription });
        } else {
            await User.findByIdAndUpdate(userId, { pushSubscription: subscription });
        }
        res.status(200).json({ message: 'Push subscription saved' });
    } catch (err) {
        console.error('Error saving push subscription:', err);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
