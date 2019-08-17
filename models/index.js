const mongoose = require('mongoose');
require('dotenv').config();

console.log('ENV mongo', process.env.MONGO);

const connection = mongoose.connect(process.env.MONGO, { dbName: 'webscrapper', useNewUrlParser: true });
connection.then(() => console.log('db connected')).catch(err => console.log(err));

const Service = mongoose.model('Service', require('./Service'));
const Course = mongoose.model('Course', require('./Course'));



module.exports = {
    Service,
    Course
}