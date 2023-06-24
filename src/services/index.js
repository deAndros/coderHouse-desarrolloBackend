const productsDao = require('../daos/mongo/ProductManager.mongo.class')
const cartsDao = require('../daos/mongo/CartManager.mongo.class')
const usersDao = require('../daos/mongo/UserManager.mongo.class')

const cartsService = new cartsDao()
const productsService = new productsDao()
const usersService = new usersDao()

module.exports = { productsService, cartsService, usersService }
