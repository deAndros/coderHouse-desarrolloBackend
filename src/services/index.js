const { ProductsDao, CartsDao } = require('../daos/factory')
const usersDao = require('../daos/mongo/UserManager.mongo.class')
const ProductsRepository = require('../repositories/products.repository')

const cartsService = new CartsDao()
//const productsService = new ProductsDao()
const productsService = new ProductsRepository(new ProductsDao())
const usersService = new usersDao()

module.exports = { productsService, cartsService, usersService }
