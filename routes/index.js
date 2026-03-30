const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'NearBuy - Local Neighborhood Services' });
});

module.exports = router;
