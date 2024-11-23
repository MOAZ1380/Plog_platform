const express = require('express');
const post_controler = require('../controler/Post_controller');
const vrifytoken = require('../middleware/verifyToken')
const upload = require('../middleware/multer')

const router = express.Router()

router.route('/main')
    .post(upload.single('photo'), vrifytoken, post_controler.add_post)
    .get(vrifytoken, post_controler.get_all_post);


router.route('/my_profile')
    .get(vrifytoken, post_controler.my_profile)


router.route('/my_profile/:post_id')
    .patch(upload.single('photo'), vrifytoken, post_controler.update_post);





module.exports = router;