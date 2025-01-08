const express = require('express');
const user_controler = require('../controler/User_controller');
const upload = require('../middleware/multer')
const verifyOwnership = require('../middleware/verifyOwnership');
const vrifytoken = require('../middleware/verifyToken');


const router = express.Router()

router.route('/register')
    .post(upload.single('photo'), user_controler.user_register)

router.route('/login')
    .post(user_controler.user_login)

router.route('/delete_account')
    .delete(vrifytoken, user_controler.delete_account)

router.route('/:userId')
    .get(vrifytoken, user_controler.get_user_by_id);

router.route('/update_profile')
    .patch(vrifytoken, upload.single('photo'), user_controler.update_profile);

router.route('/search/:searchTerm')
    .get(vrifytoken, user_controler.search_user);



module.exports = router;