const express = require('express');
const router = express.Router();
const ProductModel = require('../models/ProductModel');
const auth = require('../middlewares/auth');

router.get('/products', async (req, res) => {
    try {
        var products = await ProductModel.find({}).populate('category');
        res.status(200).json({ products });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/products/add', async (req, res) => {
    try {
        await ProductModel.create(req.body);
        res.status(201).json({ message: 'Product created successfully' });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/products/edit/:id', async (req, res) => {
    try {
        await ProductModel.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/products/delete/:id', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await ProductModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;