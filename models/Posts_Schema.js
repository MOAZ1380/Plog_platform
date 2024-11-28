const mongoose = require('mongoose');

const Post_Schema = mongoose.Schema({
    content: {
        type: String,
        required: [true, "Title is required"],
        minlength: [1, "Title must be at least 1 characters long"],
        maxlength: [5000, "Title must not exceed 100 characters"],
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
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    }]
});

module.exports = mongoose.model("Post", Post_Schema);