const asyncWrapper = require('./asyncWrapper');
const Post = require('../models/Posts_Schema');
const User = require('../models/Users_Schema'); 
const AppError = require('../utils/AppError')
const httpstatus = require('../utils/http_status');
const verifyOwnership = asyncWrapper(async (req, res, next) => {  // Verify ownership of this property 
    const { post_id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(post_id);
    if (!post) {
        return next(AppError.create("Post not found", 404, httpstatus.FAIL));
    }

    if (post.user_id.toString() !== userId) {
        return next(AppError.create("Unauthorized action", 403, httpstatus.FAIL));
    }

    req.post = post;
    next();
});

module.exports = verifyOwnership;
