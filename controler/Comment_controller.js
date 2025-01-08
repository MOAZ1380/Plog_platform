const Post = require('../models/Posts_Schema');
const User = require('../models/Users_Schema');
const Comment = require('../models/Comments_Schema');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/AppError');
const httpstatus = require('../utils/http_status');

// main and my_profile page to add comment
const add_comment = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id; // Get user ID from the token
        const { content } = req.body; // Extract content from request body

        // Validate content
        if (!content || content.trim() === "") {
            return next(new AppError('Comment content cannot be empty', 400, httpstatus.FAIL));
        }

        // Validate post existence
        const post = await Post.findById(req.params.PostId);
        if (!post) {
            return next(new AppError('Post not found', 404, httpstatus.FAIL));
        }

        // Create a new comment with the post_id
        const newComment = await new Comment({
            user_id: userId,
            content: content,
            post_id: req.params.PostId // Add post_id here
        }).save();

        // Add the new comment to the post's comments array
        post.comments.push(newComment._id);
        await post.save();

        // Populate the comments for the response
        const populatedPost = await Post.findById(post._id).populate({
            path: 'comments',
            select: 'content user_id createdAt updatedAt'
        });

        return res.json({
            status: httpstatus.SUCCESS,
            message: "Comment added successfully",
            data: populatedPost.comments
        });
    }
);



// main and my_profile page to update comment
const update_comment = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;

        const { content } = req.body;
        if (!content || content.trim() === "") {
            return next(new AppError('Comment content cannot be empty', 400, httpstatus.FAIL));
        }

        const post = await Post.findById(req.params.PostId);
        if (!post) {
            return next(new AppError('Post not found', 404, httpstatus.FAIL));
        }

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(new AppError('Comment not found', 404, httpstatus.FAIL));
        }

        if (comment.user_id.toString() !== userId.toString()) {
            return next(new AppError('You are not authorized to update this comment', 403, httpstatus.FAIL));
        }
        comment.content = content;
        comment.updatedAt = Date.now();

        await comment.save();

        // Return the updated post with populated comments
        const populatedPost = await Post.findById(post._id).populate({
            path: 'comments',
            select: 'content user_id createdAt updatedAt'
        });

        return res.json({
            status: httpstatus.SUCCESS,
            message: "Comment updated successfully",
            data: populatedPost.comments
        });
    }
);




const delete_comment = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;

        const post = await Post.findById(req.params.PostId);
        if (!post) {
            return next(new AppError('Post not found', 404, httpstatus.FAIL));
        }

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(new AppError('Comment not found', 404, httpstatus.FAIL));
        }

        if (comment.user_id.toString() !== userId.toString()) {
            return next(new AppError('You are not authorized to delete this comment', 403, httpstatus.FAIL));
        }

        await Comment.findByIdAndDelete(req.params.commentId);

        post.comments = post.comments.filter(commentId => commentId.toString() !== req.params.commentId);

        await post.save();

        const populatedPost = await Post.findById(post._id).populate({
            path: 'comments',
            select: 'content user_id createdAt updatedAt'
        });

        return res.json({
            status: httpstatus.SUCCESS,
            message: "Comment deleted successfully",
            data: populatedPost.comments
        });
    }
);

const getCommentsByPostId = asyncWrapper(
    async (req, res, next) => {
        try {
            const comments = await Comment.find({ post_id: req.params.postId })
                .populate('user_id', 'firstName lastName photo')
                .sort({ createdAt: -1 });

            res.status(200).json({
                status: httpstatus.SUCCESS,
                data: comments,
            });
        } catch (error) {
            next(AppError.create('Failed to fetch comments', 500, httpstatus.ERROR));
        }
    }
);

module.exports = {
    add_comment,
    update_comment,
    delete_comment,
    getCommentsByPostId,
};
