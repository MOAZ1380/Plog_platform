const mongoose = require('mongoose');

const User_Schema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    sex: {
        type: String,
        enum: ['male', 'female'], 
        required: true ,
    },
    photo: {
        type: String,
        default: '../uploads/Profile_photo/profile.jpg' 
    },
    createdAt: {
        type: Date,
        default:  Date.now          
    },
    birthDate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        unique: true,              
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    posts: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', 
    }],
    likedPosts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
    }]
});

module.exports = mongoose.model("User", User_Schema);