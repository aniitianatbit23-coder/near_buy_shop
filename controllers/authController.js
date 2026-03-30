const User = require('../models/User');
const Shop = require('../models/Shop');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getRegister = (req, res) => {
    const role = req.query.role || 'customer';
    res.render('register', { role, error: null });
};

exports.getLogin = (req, res) => {
    const role = req.query.role || 'customer';
    res.render('login', { role, error: null });
};

exports.postRegister = async (req, res) => {
    try {
        const { role, name, email, password, phone, latitude, longitude, shopName, category, address } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.render('register', { role, error: 'Email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let user;

        const locationData = {
            type: 'Point',
            coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
            address: address || ''
        };

        if (role === 'shopkeeper') {
            const existingShop = await Shop.findOne({ email });
            if (existingShop) return res.render('register', { role, error: 'Email already registered as shopkeeper' });
            
            user = new Shop({
                ownerName: name,
                shopName,
                email,
                password: hashedPassword,
                phone,
                category,
                location: locationData
            });
            await user.save();
        } else {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.render('register', { role, error: 'Email already in use' });
            
            user = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                location: locationData
            });
            await user.save();
        }

        res.redirect(`/login?role=${role}&success=registered`);

    } catch (err) {
        console.error(err);
        res.render('register', { role: req.body.role, error: 'Server error during registration' });
    }
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        let user;
        if (role === 'shopkeeper') {
            user = await Shop.findOne({ email });
        } else {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.render('login', { role, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { role, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        if (role === 'shopkeeper') {
            res.redirect('/shopkeeper/dashboard');
        } else {
            res.redirect('/customer/dashboard');
        }

    } catch (err) {
        console.error(err);
        res.render('login', { role: req.body.role || 'customer', error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};
