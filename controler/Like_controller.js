const Post = require('../models/Posts_Schema');
const User = require('../models/Users_Schema');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/AppError');
const httpstatus = require('../utils/http_status');

const add_like = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;
        const post = await Post.findById(req.params.Postid);

        if (!post) {
            return next(new AppError('Post not found', 404, httpstatus.FAIL));
        }

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
            post.num_like += 1;
            await post.save();
        }

        return res.json({
            status: httpstatus.SUCCESS,
            message: "Liked successfully",
            data: post,
        });
    }
);

const remove_like = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;
        const post = await Post.findById(req.params.Postid);

        if (!post) {
            return next(new AppError('Post not found', 404, httpstatus.FAIL));
        }

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
            post.num_like -= 1;
            await post.save();
        }

        return res.json({
            status: httpstatus.SUCCESS,
            message: "Like removed successfully",
            data: post,
        });
    }
);

const fetch_liked_post = asyncWrapper(
    async (req, res, next) => {
        const { Postid } = req.params;

        const post = await Post.findById(Postid)
            .populate({
                path: 'comments',
                populate: {
                    path: 'user_id',
                    select: 'firstName lastName photo',
                },
            })
            .populate({
                path: 'likes',
                select: '_id firstName lastName photo',
            });

        if (!post) {
            return res.status(404).json({
                status: httpstatus.NOT_FOUND,
                message: "Post not found",
            });
        }

        const formattedPost = {
            content: post.content,
            photo: post.photo,
            created_at: post.created_at,
            updated_at: post.updated_at,
            num_like: post.num_like,
            comments: post.comments.map(comment => ({
                firstName: comment.user_id.firstName,
                lastName: comment.user_id.lastName,
                photo: comment.user_id.photo,
                content: comment.content,
                createdAt: comment.createdAt,
            })),
            likes: post.likes.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                photo: user.photo,
            })),
        };

        return res.json({
            status: httpstatus.SUCCESS,
            post: formattedPost,
        });
    }
);



module.exports = {
    add_like,
    remove_like,
    fetch_liked_post,
};
