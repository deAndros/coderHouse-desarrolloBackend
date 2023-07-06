const { ProductsDao, CartsDao, UsersDao } = require('../daos/factory')
const UsersRepository = require('../repositories/users.repository')
const CartsRepository = require('../repositories/carts.repository')
const ProductsRepository = require('../repositories/products.repository')

const cartsService = new CartsRepository(new CartsDao())
const productsService = new ProductsRepository(new ProductsDao())
const usersService = new UsersRepository(new UsersDao())

module.exports = { productsService, cartsService, usersService }
