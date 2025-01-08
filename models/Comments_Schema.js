const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    content: { 
        type: String,
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    updatedAt: { 
        type: Date,
        default: Date.now
    },
    post_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true 
    },
});

module.exports = mongoose.model("Comment", CommentSchema);