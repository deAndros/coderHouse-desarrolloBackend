const passport = require('passport');
const local = require('passport-local');
//const {userModel} = require("TRAER EL MODELO DE USUARIOS")
const { createHash, isValidPassword } = require('../utils/bcryptHash');
