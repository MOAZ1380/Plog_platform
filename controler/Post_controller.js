const Post = require('../models/Posts_Schema');
const User = require('../models/Users_Schema');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/AppError')
const httpstatus = require('../utils/http_status');


const add_post = asyncWrapper(
    async (req, res, next) => {
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {   
            let error = AppError.create("content is required", 400, httpstatus.FAIL);
            return next(error);
        }

        if (content.length < 1 || content.length > 5000) {
            let error = AppError.create("Content must be between 1 and 5000 characters long", 400, httpstatus.FAIL);
            return next(error);
        }

        const newPost = new Post({
            user_id: userId,
            photo: req.file ? req.file.filename : null,
            content
        });

        await newPost.save();

        const user = await User.findById(userId);
        user.posts.push(newPost._id);
        await user.save();

        // Populate the user_id field before sending response
        const populatedPost = await Post.findById(newPost._id)
            .populate('user_id', 'firstName lastName photo');

        res.status(201).json({
            status: httpstatus.SUCCESS,
            data: { post: populatedPost },
        });
});

const get_all_post = asyncWrapper(
    async (req, res, next) => {
        const { page = 1, page_size = 10 } = req.query;
        const skip = (page - 1) * page_size;

        const posts = await Post.find()
            .sort({ updated_at: -1 })
            .skip(skip)
            .limit(Number(page_size))
            .populate('user_id', 'firstName lastName photo')
            .populate({
                path: 'likes',
                select: 'firstName lastName -_id',
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user_id',
                    select: 'firstName lastName -_id',
                },
            });

        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: posts,
        });
    }
);

const my_posts = asyncWrapper(
    async (req, res, next) => {
        const { page = 1, page_size = 5 } = req.query;
        const skip = (page - 1) * page_size;


        const user_info = await User.find({ _id: req.user.id }, { 'password': 0, 'posts': 0, '_id': 0, 'likedPosts': 0, '__v': 0 });
        const posts = await Post.find({ user_id: req.user.id })
            .sort({ updated_at: -1 })
            .skip(skip)
            .limit(Number(page_size))
            .populate({
                path: 'likes',
                select: 'firstName lastName -_id',
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user_id',
                    select: 'firstName lastName -_id',
                },
            });

        res.status(200).json({
            user_info,
            status: httpstatus.SUCCESS,
            data: posts,
        });
    }
);


const update_my_post = asyncWrapper(
    async (req, res, next) => {
        const { content } = req.body;


        if (content) req.post.content = content;
        if (req.file) req.post.photo = req.file.filename;

        req.post.updated_at = Date.now();

        await req.post.save();

        res.status(200).json({
            message: "Post updated successfully",
            status_code: 200,
            status_text: httpstatus.SUCCESS,
            updatedPost: req.post,
        });
    });


const delete_my_post = asyncWrapper(
    async (req, res, next) => {
        const user = await User.findById(req.user.id);

        await req.post.deleteOne();

        user.posts = user.posts.filter((id) => id.toString() !== req.post._id.toString());
        await user.save();

        res.status(200).json({
            message: "Post deleteds successfully",
            status_code: 200,
            status_text: httpstatus.SUCCESS,
            deletePost: req.post,
        });
    });




module.exports = {
    add_post,
    get_all_post,
    my_posts,
    update_my_post,
    delete_my_post,
}