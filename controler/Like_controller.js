const Post = require('../models/Posts_Schema');
const User = require('../models/Users_Schema'); 
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/AppError')
const httpstatus = require('../utils/http_status');


// main page to add post
const add_like = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;
        const post = await Post.findById(req.params.id);
        post.likes.push(userId);
        await post.save();
        return res.json("success");
});

const remove_like = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;
        const post = await Post.findById(req.params.id);
        post.likes = post.likes.filter((id) => id.toString() !== userId);
        await post.save();
        return res.json("success");
});





module.exports = {
    add_like,
    remove_like,


}