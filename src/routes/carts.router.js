const CustomRouter = require('./customRouter.class')

const {
  getCarts,
  getCartById,
  createCart,
  addProductToCart,
  updateCartProducts,
  updateProductQuantity,
  deleteProductFromCart,
  emptyCart,
  deleteCart,
} = require('../controllers/carts.controller.js')

class CartsRouter extends CustomRouter {
  init() {
    this.get('/', ['ADMIN'], getCarts)

    this.get('/:cid([a-zA-Z0-9]+)', ['ADMIN'], getCartById)

    this.post('/', ['ADMIN'], createCart)

    this.post(
      '/:cid([a-zA-Z0-9]+)/product/:pid([a-zA-Z0-9]+)',
      ['ADMIN'],
      addProductToCart
    )

    this.put('/:cid([a-zA-Z0-9]+)', ['ADMIN'], updateCartProducts)

    this.put(
      '/:cid([a-zA-Z0-9]+)/product/:pid([a-zA-Z0-9]+)',
      ['ADMIN'],
      updateProductQuantity
    )

    this.delete(
      '/:cid([a-zA-Z0-9]+)/product/:pid([a-zA-Z0-9]+)',
      ['ADMIN'],
      deleteProductFromCart
    )

    this.delete('/:cid([a-zA-Z0-9]+)/empty', ['ADMIN'], emptyCart)

    this.delete('/:cid([a-zA-Z0-9]+)', ['ADMIN'], deleteCart)
  }
}

module.exports = new CartsRouter()
