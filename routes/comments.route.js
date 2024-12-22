const express = require('express');
const Comment_controler = require('../controler/Comment_controller');
const vrifytoken = require('../middleware/verifyToken');

const router = express.Router();


router.route('/add_comment/:PostId/comment')
    .post(vrifytoken, Comment_controler.add_comment);

    
router.route('/Update_comment/:PostId/comment/:commentId')
    .patch(vrifytoken, Comment_controler.update_comment);


router.route('/remove_comment/:PostId/comment/:commentId')
    .delete(vrifytoken, Comment_controler.delete_comment);


module.exports = router;
