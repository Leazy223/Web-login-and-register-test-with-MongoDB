var ProductModel = require('../models/ProductModel');
// Import module before use
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

// URL: localhost:3000/products
// Method: GET
router.get('/', auth.checkLoginSession, async function(req, res) {
    try {
        // Get search and sort parameters from query string
        const searchQuery = req.query.search || '';
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.order || 'asc';

        // Build the query
        let query = {};
        if (searchQuery) {
            query.name = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search
        }

        // Build the sort object
        let sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Retrieve products with search and sort
        var productsList = await ProductModel.find(query).sort(sort);

        // Render view and pass data
        res.render('products/index', { 
            title: 'Products List',
            products: productsList,
            searchQuery: searchQuery,
            isSortByName: sortBy === 'name',
            isSortByPrice: sortBy === 'price',
            isAscending: sortOrder === 'asc',
            isDescending: sortOrder === 'desc',
            role: req.session.role
        });
    } catch (error) {
        console.error('Error in products route:', error);
        res.status(500).render('error', { 
            message: 'Error retrieving products',
            error: {
                status: 500,
                stack: error.stack
            }
        });
    }
});

// ULR: localhost:3000/products/add
// Medthod: POST
// Render form for user to input
router.get('/add', auth.checkAdmin, async function(req, res) {
    res.render('products/add');
});

// Receive form data and insert it to database
router.post('/add', auth.checkAdmin, async function(req, res) {
    try {
        // get value from form: req.body
        var products = req.body;
        await ProductModel.create(products);
        res.redirect('/products');
    } catch (error) {
        if (error.name === 'ValidationError') {
            let messages = {};
            for (field in error.errors) {
                messages[field] = error.errors[field].message;
            }
            res.status(400).render('products/add', { error: messages });
        } else {
            console.error(error);
            res.status(500).render('error', { error: 'Error adding product' });
        }
    }
});

// URL: localhost:3000/products/edit/:id
// Method: PUT
router.get('/edit/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    var product = await ProductModel.findById(id);
    res.render('products/edit', { product: product });
});

router.post('/edit/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    var data = req.body;
    await ProductModel.findByIdAndUpdate(id, data);
    res.redirect('/products');
});

// URL: localhost:3000/products/delete/:id
// Method: DELETE
router.get('/delete/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    await ProductModel.findByIdAndDelete(id);
    res.redirect('/products');
});

module.exports = router;