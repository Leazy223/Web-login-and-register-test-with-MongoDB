var mongoose = require('mongoose');
var ProductSchema = mongoose.Schema({
    name: { type: String,
            minLeangth: [3, 'Name must be at least 3 characters long'],
            maxLength: [30, 'Name must be at most 30 characters long'],
            required: true },
    price: { type: Number,
                min: [0, 'Price must be a positive number'],
            required: true },
    image: { type: String },
    description: { type: String },
    category: {             // Category reference   
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'categories' 
               }
});

var ProductModel = mongoose.model('Products', ProductSchema);
// export the model
module.exports = ProductModel;