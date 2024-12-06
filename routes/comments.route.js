const express = require('express');
const Comment_controler = require('../controler/Comment_controller');
const vrifytoken = require('../middleware/verifyToken');

const router = express.Router();


router.route('/main/:id/comment')
    .post(vrifytoken, Comment_controler.add_comment);

router.route('/my_profile/:id/comment')
    .post(vrifytoken, Comment_controler.add_comment);


router.route('/main/:id/comment/:commentId')
    .patch(vrifytoken, Comment_controler.update_comment);

router.route('/my_profile/:id/comment/:commentId')
    .patch(vrifytoken, Comment_controler.update_comment);

module.exports = router;
