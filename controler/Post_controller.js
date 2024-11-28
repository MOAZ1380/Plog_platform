const Post = require('../models/Posts_Schema');
const User = require('../models/Users_Schema'); 
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/AppError')
const httpstatus = require('../utils/http_status');


// main page to add post
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
            user_id : userId,
            photo: req.file ? req.file.filename : null,
            content,
            user: userId,
        });

        await newPost.save();

        const user = await User.findById(userId);
        user.posts.push(newPost._id);
        await user.save();

        res.status(201).json({
            status: httpstatus.SUCCESS,
            data: { post: newPost },
        });
});

// main page To browse all pages
const get_all_post = asyncWrapper(
    async (req, res, next) => {
        // inInfinite Scroll
        const { page = 1, page_size = 10 } = req.query;
        const skip  = (page - 1) * page_size;

        const posts = await Post.find()
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(Number(page_size))
        .exec();

        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: posts,
        });
});

// my_profile -> my_data and my_posts
const my_profile = asyncWrapper(
    async (req, res, next) => {
        

        const { page = 1, page_size = 5 } = req.query;
        const skip  = (page - 1) * page_size;

        const user = await User.findOne(
            { email: req.user.email },
            { "__v": false, "password": false }
        )
        .populate({
                path: 'posts',
                select: '-__v -_id',
                options: {
                    skip: skip,
                    limit: page_size,
                    sort: { updated_at: -1 },
                },
            });

        const totalPosts = await Post.countDocuments({ user_id : user._id });
        // console.log(totalPosts);
        const hasMore = skip + page_size < totalPosts;

        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: {
                user_name: user.firstName + " " + user.lastName,
                sex: user.sex,
                my_photo: user.photo,
                birthDate: user.birthDate,
                email: user.email,
                posts: user.posts,
                hasMore,
            },
            });
});


// update_post from my_profile
const update_post = asyncWrapper(
    async (req, res, next) => {
        const { content } = req.body;
        const { post_id }= req.params;

        const post = await Post.findById(post_id);
        if (!post) {
            let error = AppError.create("Post not found", 404, httpstatus.FAIL);
            return next(error);
        }

        if (content) post.content = content;
        if (req.file) post.photo = req.file.filename; 

        post.updated_at = Date.now();

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            status_code: 200,
            status_text: httpstatus.SUCCESS,
            updatedPost: post,
        });
});


// delete_post from my_profile
const delete_post = asyncWrapper(
    async (req, res, next) => {
        const { post_id }= req.params;
        const user = await User.findById(req.user.id);

        const post_delete = await Post.findOneAndDelete({ _id : post_id });
        if (!post_delete) {
            let error = AppError.create("Post not found", 404, httpstatus.FAIL);
            return next(error);
        }

        user.posts = user.posts.filter((id) => id.toString() !== post_id);
        await user.save();

        res.status(200).json({
            message: "Post deleteds successfully",
            status_code: 200,
            status_text: httpstatus.SUCCESS,
            deletePost: post_delete,
        });
});




module.exports = {
    add_post,
    get_all_post,
    my_profile,
    update_post,
    delete_post,
}