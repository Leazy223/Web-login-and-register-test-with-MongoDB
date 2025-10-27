var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
});

var CategoryModel = mongoose.model('Categories', CategorySchema);
// export the model
module.exports = CategoryModel;