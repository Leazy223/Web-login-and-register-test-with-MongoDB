var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
});

var UserModel = mongoose.model('Users', schema);

// export the model
module.exports = UserModel;
