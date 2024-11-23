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
        const my_posts = await User.findOne({ email: req.user.email },{"__v" : false, "password" : false}).populate('posts', '-__v -_id ');
        res.status(200).json({
            status: httpstatus.SUCCESS,
            data:{
                user_name : my_posts.firstName +" "+ my_posts.lastName,
                sex : my_posts.sex,
                my_photo : my_posts.photo,
                birthDate : my_posts.birthDate,
                email : my_posts.email,
                posts : my_posts.posts,
            }
        });
});







// update_post
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





module.exports = {
    add_post,
    get_all_post,
    my_profile,
    update_post,
}