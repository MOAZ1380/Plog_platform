const multer  = require('multer');
const path  = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const httpstatus = require('../utils/http_status');

function fileFilter (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(AppError.create("file must be image",  400, httpstatus.FAIL), false);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log(req.originalUrl);
        let folderPath = req.originalUrl.includes('users') ? 'uploads/Profile_photo' : 'uploads/Posts_photo';

        fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        let folderPath = req.originalUrl.includes('users') ? 'User' : 'Post';
        const newFilename = `${folderPath}-` + Date.now() + path.extname(file.originalname);
        cb(null, newFilename);
    }
});

const upload = multer({ storage: storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
});

module.exports = upload;