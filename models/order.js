var mongoose = require('mongoose')

var Schema = mongoose.Schema

var OrderSchema = new Schema({
    distance: String,
    originCoord: [Number],
    destCoord: [Number],
    status: String
})

module.exports = mongoose.model('Order', OrderSchema)