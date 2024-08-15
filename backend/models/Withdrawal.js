const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }, 
    coin: {
        type: String,
        required: true,
    },
    wallet: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["approved", "pending"],
        default: "pending",
    },
    
})

module.exports = mongoose.model('Withdraw', withdrawSchema)