const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }, 
    coin: {
        type: String,
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Plan'
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["approved", "pending", "ended"],
        default: "pending",
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    profit: {
        type: Number,
    },
    
})


module.exports = mongoose.model('Investment', investmentSchema)