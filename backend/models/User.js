const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please enter your first name!"],
    },
    userName: {
        type: String,
        required: [true, "Please enter your username!"],
    },
    email: {
    type: String,
    required: [true, "Please enter your email address"],
    },
    password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
    },
    phoneNumber: {
    type: Number,
    required: true,
    },
    plans: [{
        type: Array,
    }],
    roles: {
    type: String,
    default: "User",
    },
    balance: {
        type: Number,
        default: 0,
    },
    createdAt: {
    type: Date,
    default: Date.now(),
    },
})

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id}, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: "7d",
    });
  };

module.exports = mongoose.model('User', userSchema)