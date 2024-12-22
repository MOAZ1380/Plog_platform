var jwt = require('jsonwebtoken');

module.exports = async(payload) =>{
    const my_token = await jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '40d' })
    return my_token;
};