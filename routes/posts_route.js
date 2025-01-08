const express = require('express');
const verifyOwnership = require('../middleware/verifyOwnership');
const post_controler = require('../controler/Post_controller');
const vrifytoken = require('../middleware/verifyToken');
const upload = require('../middleware/multer');

const router = express.Router()

router.route('/AddPost')
    .post(upload.single('photo'), vrifytoken, post_controler.add_post);


router.route('/GetAllPost')
    .get(vrifytoken, post_controler.get_all_post);

router.route('/delete_update/:post_id')
    .delete(vrifytoken, verifyOwnership, post_controler.delete_my_post)
    .patch(upload.single('photo'), vrifytoken, verifyOwnership, post_controler.update_my_post);

router.route('/GetMyPost')
    .get(vrifytoken, post_controler.my_posts);

router.route('/GetUserPost/:UserId')
    .get(vrifytoken, post_controler.get_user_post);

router.route('/search/:SearchPost')
    .get(vrifytoken, post_controler.search_post);
module.exports = router;