// Import module before use
var CategoryModel = require('../models/CategoryModel');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

// URL: localhost:3000/categories
// SQL: SELECT * FROM categories
// Method: GET
// must inclue "async" to use "await"
router.get('/', auth.checkLoginSession, async function(req, res) {
    try {
        // retrieve all categories
        var categoriesList = await CategoryModel.find();
        // Render view and pass data
        res.render('categories/index', { 
            title: 'Categories List',
            categories: categoriesList,
            role: req.session.role
        });
    } catch (error) {
        console.error('Error in categories route:', error);
        res.status(500).render('error', { 
            message: 'Error retrieving categories',
            error: {
                status: 500,
                stack: error.stack
            }
        });
    }
});

// ULR: localhost:3000/categories/add
// Medthod: POST
// Render form for user to input
router.get('/add', auth.checkAdmin, async function(req, res) {
    res.render('categories/add');
});

// Receive form data and insert it to database
router.post('/add', auth.checkAdmin, async function(req, res) {
    // get value from form: req.body
    var categories = req.body;
    await CategoryModel.create(categories);
    res.redirect('/categories');
});

// URL: localhost:3000/categories/edit/:id
// Method: PUT
router.get('/edit/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    var category = await CategoryModel.findById(id);
    res.render('categories/edit', { category: category });
});

router.post('/edit/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    var data = req.body;
    await CategoryModel.findByIdAndUpdate(id, data);
    res.redirect('/categories');
});

// URL: localhost:3000/categories/delete/:id
// Method: DELETE
router.get('/delete/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    await CategoryModel.findByIdAndDelete(id);
    res.redirect('/categories');
});

// filter category by id detail
router.get('/detail/:id', auth.checkLoginSession, async function(req, res) {
    var id = req.params.id;
    var productsList = await CategoryModel.findById(id);
    res.render('categories/detail', { products: productsList });
});

module.exports = router;