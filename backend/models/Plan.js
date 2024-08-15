const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    profitPercentage: {
        type: Number, 
        required: true,
    },
    coin: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})


module.exports = mongoose.model('Plan', planSchema)