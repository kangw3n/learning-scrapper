const express = require('express');
const router = express.Router();
const fs = require('fs');

const { Service } = require('../models');

const ADMIN_ROUTE = process.env.ADMIN_ROUTE;
const USER = process.env.ADMIN;
const PASSWORD = process.env.PASSWORD;

const authState = (req, res, next) => {
    if (process.env.stagging) {
        return next();
    }
    if (req.session.user) {
        if (req.session.user === process.env.ADMIN) {
            return next();
        }
    }
    return res.redirect(process.env.HOST + ADMIN_ROUTE + '/login');
};


router.get('/login', async (req, res) => {
    if (req.session.user) {
        return res.redirect(process.env.HOST + ADMIN_ROUTE);
    }
    let { message } = req.query;

    res.render('admin/login', {
        message,
        layout: 'admin/layout'
    });
});

router.post('/login', (req, res) => {
    let { username, password } = req.body;

    if (username === user.name && password === user.password) {
        req.session.user = username;
        return res.redirect(process.env.HOST + ADMIN_ROUTE + '/');
    }

    return res.redirect(process.env.HOST + ADMIN_ROUTE + '/login/?message=invalid');
});
