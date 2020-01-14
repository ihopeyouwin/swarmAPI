const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('fetching users failed', 500));
    }
    res.json({users: users.map(user => user.toObject({getters: true})) })
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }

    const {name, email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        return next(new HttpError('something went wrong, signing up failed', 500));
    }

    if (existingUser) {
        return next(new HttpError('User already exists, please login instead', 422));
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://www.google.com/url?sa=i&source=images&cd=&ved=2ahUKEwiG5uj8pYDnAhUCCewKHXXSCr4QjRx6BAgBEAQ&url=https%3A%2F%2Fwww.freepik.com%2Ffree-icon%2Fuser-image-with-black-background_751548.htm&psig=AOvVaw2cUk2l-h7FPUNoYoH_aQRE&ust=1578995290761992',
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
          'Signing up failed, please try again later',
          500
        );
        return next(error)
    }

    res.status(201).json({user: createdUser.toObject({getters: true})});
};


const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        return next(new HttpError('something went wrong, logging in failed', 500));
    }


    if (!existingUser || existingUser.password !== password) {
        return next(new HttpError('could not identify user, credentials seem to be wrong or password is incorrect', 401))
    }
    res.json({message: 'logged in'})
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
