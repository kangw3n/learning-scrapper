const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CourseSchema = Schema({
    title: {
        type: String,
        unique: true,
        index: true
    },
    url: {
        type: String
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    price: String,
    img: String,
    updated_date: {
        type: Date,
        default: Date.now
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});


module.exports = CourseSchema;
