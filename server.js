const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
