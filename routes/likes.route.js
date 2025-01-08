const express = require('express');
const like_controler = require('../controler/Like_controller');
const vrifytoken = require('../middleware/verifyToken')

const router = express.Router()

router.route('/add_like/:Postid/like')
    .post(vrifytoken, like_controler.add_like);

router.route('/remove_like/:Postid/unlike')
    .post(vrifytoken, like_controler.remove_like);

router.route('/fetch_likeAndComment/:Postid')
    .get(vrifytoken, like_controler.fetch_liked_post);





module.exports = router;