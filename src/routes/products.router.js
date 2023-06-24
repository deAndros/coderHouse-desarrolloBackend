const CustomRouter = require('./customRouter.class.js')
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller.js')

class ProductsRouter extends CustomRouter {
  init() {
    this.get('/', ['ADMIN'], getProducts)

    this.get('/:pid([a-zA-Z0-9]+)', ['ADMIN'], getProductById)

    this.post('/', ['ADMIN'], addProduct)

    this.put('/:id([a-zA-Z0-9]+)', ['ADMIN'], updateProduct)

    this.delete('/:id([a-zA-Z0-9]+)', ['ADMIN'], deleteProduct)
  }
}

module.exports = new ProductsRouter()
