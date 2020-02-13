const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS'){
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];  // auth: 'bearer token'(got token)
        if (!token) {
            throw new HttpError('Authentication failed')
        }
        const decodedToken = jwt.verify(token, 'super_secret_dont_share');
        req.userData = {userId: decodedToken.userId};
        next();
    } catch (err) {
        return next(new HttpError('Authentication failed', 401))
    }
};
