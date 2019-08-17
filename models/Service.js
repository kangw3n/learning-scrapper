const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
    name: String,
    url: String,
    updated_date: {
        type: Date,
        default: Date.now
    }
});


module.exports = ServiceSchema;
