const express = require('express');
const usersControllers = require('../controllers/user-controller');

const router = express.Router();

router.get('/', usersControllers.getUsers);
router.post('/sighup', usersControllers.signUp);
router.post('/login', usersControllers.login);

module.exports = router;
