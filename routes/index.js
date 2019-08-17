const express = require('express');
const router = express.Router();

const { Service } = require('../models');


router.get('/', async(req, res) => {
    let service = await Service.find({});
    console.log('service', service);




    return res.render('index', {
        service
    })
});

module.exports = router;