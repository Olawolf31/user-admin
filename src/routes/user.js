const routes = require('express').Router()
const formidableMiddleware = require('express-formidable');

const register = require('../controllers/userLogic')


routes.post('/register', formidableMiddleware(), register)


module.exports = routes