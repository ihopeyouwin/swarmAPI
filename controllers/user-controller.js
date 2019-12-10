const HttpError = require('../models/http-error');
const uuid = require('uuid/v4');

const Dummy_Users = [
  {
    id: 'u1', name: 'why why', email: 'test@test.com', password: '12345'
  }
];


const getUsers = (req, res, next) => {
  res.json({ users: Dummy_Users })
};

const signUp = (req, res, next) => {
  const { name, email, password } = req.body;
  const createdUser = {
    id: uuid(),
    name,
    email,
    password
  };
  Dummy_Users.push(createdUser);
  res.status(201).json({user: createdUser});
};


const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = Dummy_Users.find(user => user.email === email);
  if (!identifiedUser || identifiedUser.password !== password){
    throw new HttpError('could not identify user, credentials seem to be wrong or password is incorrect', 401)
  }
  res.json({message: 'logged in'})
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
