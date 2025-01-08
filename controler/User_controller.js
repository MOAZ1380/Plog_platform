const User = require('../models/Users_Schema');
const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcryptjs');
const Post = require('../models/Posts_Schema');
const validator = require('validator');
const generateToken = require('../utils/generate_token');
const AppError = require('../utils/AppError')
const httpstatus = require('../utils/http_status');


const user_register = asyncWrapper(
    async (req, res, next) => {
        const { firstName, lastName, sex, birthDate, email, password } = req.body;

        if (!validator.isEmail(email)) {
            let error = AppError.create("Invalid email",  400, httpstatus.FAIL);
            return next(error);
        }

        const old_user = await User.findOne({ email });
        if (old_user) {
            let error = AppError.create("User already exists",  400, httpstatus.FAIL);
            return next(error);
        }

        const validDate = new Date(birthDate);
        if (isNaN(validDate.getTime())) {
            let error = AppError.create("Invalid birth date",  400, httpstatus.FAIL);
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userPhoto = req.file ? req.file.filename : null;

        const new_user = new User({
            firstName,
            lastName,
            sex,
            birthDate: validDate,
            email,
            password: hashedPassword,
            photo: userPhoto,
        });
        const token =  await generateToken({email: new_user.email, id: new_user._id});
        await new_user.save();

        res.status(201).json({
            status: httpstatus.SUCCESS,
            data: { user: new_user , my_token: token},
        });
});

const user_login = asyncWrapper(
    async(req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            let error = AppError.create("Email and password are required",  400, httpstatus.FAIL);
            return next(error);
        }

        const user = await User.findOne({ email });
        if (!user) {
            let error = AppError.create("User not found",  404, httpstatus.FAIL);
            return next(error);
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            let error = AppError.create("Invalid credentials",  401, httpstatus.FAIL);
            return next(error);
        }
        const token = await generateToken({email: user.email, id: user._id});
        
        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: { message: "Login successful", my_token: token}
        });
});

const delete_account = asyncWrapper(
    async (req, res, next) => {
        const user = req.user;
        const [delete_user, delete_post] = await Promise.all([
            User.findByIdAndDelete(user.id),
            Post.deleteMany({ user_id: user.id }),
        ]);
        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: { message: "Account and Posts deleted successfully " }
        });
});

const update_profile = asyncWrapper(
    async (req, res, next) => {
        const userId = req.user.id;
        const updateData = req.body; 


        if (updateData.email) {
            if (!validator.isEmail(updateData.email)) {
                let error = AppError.create("Invalid email", 400, httpstatus.FAIL);
                return next(error);
            }

            const oldUser = await User.findOne({ email: updateData.email });
            if (oldUser && oldUser.id !== req.user.id) {
                let error = AppError.create("Email already in use by another user", 400, httpstatus.FAIL);
                return next(error);
            }
        }


        if (Object.keys(updateData).length === 0 && req.file === undefined) {
            let error = AppError.create("No data provided for update", 400, httpstatus.FAIL);
            return next(error);
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(AppError.create("User not found", 404, httpstatus.FAIL));
        }

        if (updateData.password) {  
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            user.password = hashedPassword; 
        }

        if(req.file){
            user.photo = req.file.filename;
        }

        Object.keys(updateData).forEach((key) => {
            if (key !== "password") {
                user[key] = updateData[key];
            }
        });

        await user.save();

        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: { user },
        });
    }
);


module.exports = {
    user_register,
    user_login,
    delete_account,
    update_profile,
};
