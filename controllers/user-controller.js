const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('fetching users failed', 500));
    }
    res.json({users: users.map(user => user.toObject({getters: true}))})
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

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Could not create a user', 500))
    }


    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
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

    let token;
    try {
        token = jwt.sign(
          {userId: createdUser.id, email: createdUser.email},
          'super_secret_dont_share',
          {expiresIn: '1h'}
        );
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later', 500))
    }

    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
};

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        return next(new HttpError('something went wrong, logging in failed', 500));
    }
    if (!existingUser) {
        return next(new HttpError('could not identify user, credentials seem to be wrong or password is incorrect', 401))
    }
    let isPasswordCorrect;
    try {
        isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        return next(new HttpError('something went wrong, logging in failed, check credentials and try again', 500));
    }
    if (!isPasswordCorrect) {
        return next(new HttpError('credentials seem to be wrong or password is incorrect', 401))
    }

    let token;
    try {
        token = jwt.sign(
          {userId: existingUser.id, email: existingUser.email},
          'super_secret_dont_share',
          {expiresIn: '1h'}
        );
    } catch (err) {
        return next(new HttpError('logging in failed, please try again later', 500))
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
