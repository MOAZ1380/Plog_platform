const User = require('../models/Users_Schema');
const Comment = require('../models/Comments_Schema')
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
        const userId = req.user.id;

        try {

            await Post.deleteMany({ user_id: userId });

            await Comment.deleteMany({ user_id: userId });

            const deletedUser = await User.findByIdAndDelete(userId);

            if (!deletedUser) {
                console.log('User not found');
                let error = AppError.create("User not found", 404, httpstatus.FAIL);
                return next(error);
            }

            console.log('Account and all associated data deleted successfully');
            res.status(200).json({
                status: httpstatus.SUCCESS,
                data: { message: "Account and all associated data deleted successfully" },
            });
        } catch (error) {
            console.error('Error deleting account:', error);
            let err = AppError.create("Failed to delete account", 500, httpstatus.FAIL);
            return next(err);
        }
    }
);

const get_user_by_id = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return next(AppError.create('User not found', 404, httpstatus.FAIL));
        }

        const username = `${user.firstName} ${user.lastName}`;

        res.status(200).json({
            status: httpstatus.SUCCESS,
            data: { ...user._doc, username },
        });
    } catch (error) {
        next(AppError.create('Server error', 500, httpstatus.ERROR));
    }
};


const update_profile = asyncWrapper(
    async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword, confirmPassword, ...updateData } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return next(AppError.create("User not found", 404, httpstatus.FAIL));
            }

            if (newPassword) {
                if (!currentPassword) {
                    return next(AppError.create("Current password is required", 400, httpstatus.FAIL));
                }

                const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordMatch) {
                    return next(AppError.create("Current password is incorrect", 400, httpstatus.FAIL));
                }

                if (newPassword !== confirmPassword) {
                    return next(AppError.create("New password and confirmation do not match", 400, httpstatus.FAIL));
                }

                user.password = await bcrypt.hash(newPassword, 10);
            }

            if (updateData.email) {
                if (!validator.isEmail(updateData.email)) {
                    return next(AppError.create("Invalid email", 400, httpstatus.FAIL));
                }

                const existingUser = await User.findOne({ email: updateData.email });
                if (existingUser && existingUser.id !== userId) {
                    return next(AppError.create("Email already in use by another user", 400, httpstatus.FAIL));
                }
            }

            if (req.file) {
                updateData.photo = req.file.filename;
            }

            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    user[key] = updateData[key];
                }
            });

            await user.save();

            res.status(200).json({
                status: httpstatus.SUCCESS,
                data: { user },
            });
        } catch (error) {
            console.error('Error in update_profile:', error);
            next(AppError.create("Internal server error", 500, httpstatus.ERROR));
        }
    }
);

const search_user = async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;

        const users = await User.find({
            $or: [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        }).select('-password');

        if (!users || users.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No users found matching the search term',
            });
        }

        res.status(200).json({
            status: 'success',
            data: users,
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to search users',
        });
    }
};
module.exports = {
    user_register,
    user_login,
    delete_account,
    get_user_by_id,
    update_profile,
    search_user,
};