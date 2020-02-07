const express = require('express');
const usersControllers = require('../controllers/user-controller');
const {check} = require('express-validator');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersControllers.getUsers);
router.post(
  '/signup',
  fileUpload.single('image'),
  [
      check('name').not().isEmpty(),
      check('email').normalizeEmail().isEmail(),
      check('password').isLength({min: 6})
  ], usersControllers.signUp);
router.post('/login', usersControllers.login);

module.exports = router;
