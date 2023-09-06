const { ProductsDao, CartsDao, UsersDao } = require('../daos/factory')
const UsersRepository = require('../repositories/users.repository')
const CartsRepository = require('../repositories/carts.repository')
const ProductsRepository = require('../repositories/products.repository')

const cartsService = new CartsRepository(CartsDao)
const productsService = new ProductsRepository(ProductsDao)
const usersService = new UsersRepository(UsersDao)

module.exports = { productsService, cartsService, usersService }
