
var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var salt = 8;
var UserModel = require('../models/UserModel');

router.get('/register', function(req, res) {
    res.render('auth/register', { layout : 'auth_layout' });
});

router.post('/register', async function(req, res) {
    try {
        const { username, password, role } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.render('auth/register', {
                layout: 'auth_layout',
                error: 'Username and password are required'
            });
        }

        // Check if username already exists
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.render('auth/register', {
                layout: 'auth_layout',
                error: 'Username already exists'
            });
        }

        // Create new user
        const user = await UserModel.create({
            username,
            password, // storing password as plain text to match existing data
            role: role || 'customer'
        });

        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/login', function(req, res) {
    res.render('auth/login', { layout: 'auth_layout' });
});

router.post('/login', async function(req, res) {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.render('auth/login', { 
                layout: 'auth_layout',
                error: 'Username and password are required'
            });
        }

        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.render('auth/login', { 
                layout: 'auth_layout',
                error: 'Invalid username or password'
            });
        }

        if (user.password !== password) {  // Direct comparison since passwords in DB are not hashed
            return res.render('auth/login', { 
                layout: 'auth_layout',
                error: 'Invalid username or password'
            });
        }

        req.session.username = user.username;
        req.session.role = user.role;
        
        // Redirect to the stored return URL or home page
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;  // Clear the stored URL
        res.redirect(returnTo);
    } catch (error) {
        console.error('Error during login:', error);
        res.render('auth/login', { 
            layout: 'auth_layout',
            error: 'An error occurred during login'
        });
    }
});

router.get('/logout', function(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
