const jwt = require('jsonwebtoken');
const http_status = require('../utils/http_status');
const User = require('../models/Users_Schema'); 
const asyncWrapper = require('../middleware/asyncWrapper');


const verifyToken = asyncWrapper(
    async (req, res, next) => {
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];

    if (!authHeader) {
        return res.status(400).json({
            message: "Token is required",
            status_code: 400,
            status_text: http_status.FAIL,
        });
    }
    const token = authHeader.split(' ')[1];  // del "Bearer"
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decodedToken);
        const user = await User.findOne({ email: decodedToken.email });
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status_code: 404,
                status_text: http_status.FAIL,
            });
        }
        
        req.user = decodedToken;
        next();
});


module.exports = verifyToken;
