const express = require('express');
const verifyOwnership = require('../middleware/verifyOwnership');
const post_controler = require('../controler/Post_controller');
const vrifytoken = require('../middleware/verifyToken');
const upload = require('../middleware/multer');

const router = express.Router()

// main route
router.route('/main')
    .post(upload.single('photo'), vrifytoken, post_controler.add_post)
    .get(vrifytoken, post_controler.get_all_post);

router.route('/main/:post_id')
    .delete(vrifytoken, verifyOwnership, post_controler.delete_post)
    .patch(upload.single('photo'), vrifytoken, verifyOwnership, post_controler.update_post);

// my_profile route
router.route('/my_profile')
    .get(vrifytoken, post_controler.my_profile);

router.route('/my_profile/:post_id')
    .delete(vrifytoken, verifyOwnership, post_controler.delete_post)
    .patch(upload.single('photo'), vrifytoken, verifyOwnership, post_controler.update_post);





module.exports = router;