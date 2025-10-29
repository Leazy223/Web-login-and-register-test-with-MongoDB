const ProductModel = require('../models/ProductModel');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/imageUpload');
const CategoryModel = require('../models/CategoryModel');

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

    // Retrieve products with search and sort (populate category name)
    var productsList = await ProductModel.find(query).sort(sort).populate('category');
        // Debug: log image filenames to help diagnose missing images
        try {
            console.log('Products images:', productsList.map(p => ({ id: p._id.toString(), image: p.image })));
        } catch (logErr) {
            console.error('Error logging product images:', logErr);
        }

        // Build an imagePath for each product so the view can use the correct
        // local file if the stored filename doesn't directly match (fallback).
        try {
            const fs = require('fs');
            const path = require('path');
            const imagesDir = path.join(__dirname, '..', 'public', 'images');
            let diskFiles = [];
            try {
                diskFiles = fs.readdirSync(imagesDir);
            } catch (e) {
                console.warn('Could not read images directory:', e.message);
            }

            productsList.forEach(p => {
                const imgName = p.image || '';
                let resolved = null;
                if (imgName && diskFiles.includes(imgName)) {
                    resolved = '/images/' + imgName;
                } else if (imgName) {
                    // try to find any file that contains the stored name as substring
                    const base = imgName.replace(/\.[^/.]+$/, '');
                    const found = diskFiles.find(fn => fn.includes(base));
                    if (found) resolved = '/images/' + found;
                }
                // attach a derived imagePath property for the template
                // convert mongoose doc to plain object property if needed
                try {
                    p.imagePath = resolved; // template can use this.imagePath
                } catch (e) {
                    // ignore
                }
            });
        } catch (e) {
            console.error('Error resolving image paths:', e);
        }

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
    try {
        const categories = await CategoryModel.find().sort({ name: 1 });
        res.render('products/add', { categories: categories });
    } catch (error) {
        console.error('Error loading categories for add form:', error);
        res.render('products/add', { categories: [] });
    }
});

// Receive form data and insert it to database
router.post('/add', auth.checkAdmin, uploadImage('image'), async function(req, res) {
    try {
        console.log('Form data received:', req.body);
        console.log('Upload info:', { file: req.file, uploadError: req.uploadError });

        // If upload middleware reported an error, render the form with that error
        if (req.uploadError) {
            const errMsg = req.uploadError.message || 'Error uploading file';
            const categories = await CategoryModel.find().sort({ name: 1 });
            return res.status(400).render('products/add', {
                errors: { image: errMsg },
                product: req.body,
                categories: categories
            });
        }

        // Create product object with validated data
        const product = {
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category,
            image: req.file ? req.file.filename : undefined
        };

        console.log('Attempting to create product with data:', product);

        // Validate category exists
        const catExists = await CategoryModel.findById(product.category);
        if (!catExists) {
            const categories = await CategoryModel.find().sort({ name: 1 });
            return res.status(400).render('products/add', {
                errors: { category: 'Selected category does not exist' },
                product: req.body,
                categories: categories
            });
        }

        // Create the product
        const newProduct = await ProductModel.create(product);
        console.log('Product created successfully:', newProduct);

        res.redirect('/products');
    } catch (error) {
        console.error('Error creating product:', error);

        if (error.name === 'ValidationError') {
            let messages = {};
            for (let field in error.errors) {
                messages[field] = error.errors[field].message;
            }
            console.log('Validation errors:', messages);
            const categories = await CategoryModel.find().sort({ name: 1 });
            return res.status(400).render('products/add', { errors: messages, product: req.body, categories: categories });
        } else {
            console.error('Error adding product:', error);
            const categories = await CategoryModel.find().sort({ name: 1 });
            return res.status(500).render('products/add', { 
                errors: { general: error.message || 'Error adding product' },
                product: req.body,
                categories: categories
            });
        }
    }
});

// URL: localhost:3000/products/edit/:id
// Method: PUT
router.get('/edit/:id', auth.checkAdmin, async function(req, res) {
    try {
        var id = req.params.id;
        var product = await ProductModel.findById(id).populate('category');
        const categories = await CategoryModel.find().sort({ name: 1 });
        res.render('products/edit', { product: product, categories: categories });
    } catch (error) {
        console.error('Error loading product for edit:', error);
        res.redirect('/products');
    }
});

router.post('/edit/:id', auth.checkAdmin, uploadImage('image'), async function(req, res) {
    try {
        var id = req.params.id;
        var data = req.body;

        // If upload reported an error, show edit form with error
        if (req.uploadError) {
            const errMsg = req.uploadError.message || 'Error uploading file';
            const categories = await CategoryModel.find().sort({ name: 1 });
            return res.status(400).render('products/edit', {
                product: Object.assign({}, req.body, { _id: id }),
                errors: { image: errMsg },
                categories: categories
            });
        }

        // If a new image was uploaded, update the image field
        if (req.file) {
            data.image = req.file.filename;
        }
        // Ensure category is valid (on edit)
        if (data.category) {
            const cat = await CategoryModel.findById(data.category);
            if (!cat) {
                const categories = await CategoryModel.find().sort({ name: 1 });
                return res.status(400).render('products/edit', {
                    product: Object.assign({}, req.body, { _id: id }),
                    errors: { category: 'Selected category does not exist' },
                    categories: categories
                });
            }
        }
        
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, data, { new: true });
        if (!updatedProduct) {
            throw new Error('Product not found');
        }
        
        res.redirect('/products');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).render('products/edit', { 
            product: Object.assign({}, req.body, { _id: req.params.id }),
            errors: { general: error.message || 'Error updating product' }
        });
    }
});

// URL: localhost:3000/products/delete/:id
// Method: DELETE
router.get('/delete/:id', auth.checkAdmin, async function(req, res) {
    var id = req.params.id;
    await ProductModel.findByIdAndDelete(id);
    res.redirect('/products');
});

module.exports = router;