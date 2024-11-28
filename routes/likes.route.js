const express = require('express');
const like_controler = require('../controler/Like_controller');
const vrifytoken = require('../middleware/verifyToken')

const router = express.Router()

router.route('/:id/like')
    .post(vrifytoken, like_controler.add_like);

router.route('/:id/unlike')
    .post(vrifytoken, like_controler.remove_like);







module.exports = router;