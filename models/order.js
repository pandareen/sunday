var mongoose = require('mongoose')
var Schema = mongoose.Schema

var OrderSchema = new Schema({
    category: String,
    name: String,
    price: Number,
    cover: String
})

module.exports = mongoose.model('Product', ProductSchema)