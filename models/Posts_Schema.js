const mongoose = require('mongoose');

const Post_Schema = mongoose.Schema({
    content: {
        type: String,
        required: [true, "content is required"],
        minlength: [1, "content must be at least 1 characters long"],
        maxlength: [5000, "content must not exceed 5000 characters"],
    },
    photo: {
        type: String,
        required: false,
    },
    created_at: {
        type: Date,
        default: Date.now           
    },
    updated_at: {
        type: Date,
        default: Date.now           
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    num_like: {
        type: Number,
        default : 0
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    }],
    comments: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', 
    }]
}, { timestamps: true });

module.exports = mongoose.model("Post", Post_Schema);