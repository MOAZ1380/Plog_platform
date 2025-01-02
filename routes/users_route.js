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




module.exports = router;