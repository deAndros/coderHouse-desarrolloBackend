const { getProducts, getProductById } = require('./products.controller')
const { cartsService } = require('../services/index')

class CartController {
  getCarts = async (request, response) => {
    try {
      const carts = await cartsService.get()
      response.sendSuccess({ carts: carts })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  getCartById = async (request, response) => {
    try {
      const cart = await cartsService.getById(request.params.cid)

      if (!cart)
        return response.sendUserError(
          new Error(`No existe un carrito con el id ${request.params.cid}`)
        )

      response.sendSuccess({ cart: cart })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  createCart = async (request, response) => {
    const products = request.body.products

    request.headers.internalRequest = true

    const storedProducts = await getProducts(request, response)
    const missingProducts = []

    //TODO: Agregar validación para que no se pueda ingresar el mismo producto dos veces

    //Valido que los productos que recibí por parámetro existan en mi colección de productos
    for (const productToValidate of products) {
      let productFound = storedProducts.find((storedProduct) => {
        let isValidProduct =
          storedProduct._id.toString() === productToValidate.product.toString()

        let isValidQuantity =
          Number.isInteger(productToValidate.quantity) &&
          productToValidate.quantity > 0

        return isValidProduct && isValidQuantity
      })

      if (!productFound) {
        missingProducts.push(productToValidate.product)
      }
    }

    if (missingProducts.length > 0)
      return response.sendUserError(
        new Error(
          `Los siguientes productos no existen en la base de datos o bien fueron ingresados con cantidades negativas/decimales: ${missingProducts.join(
            ', '
          )}. La operación será realizada solo si existen todos los productos enviados y los mismos se ingresan con cantidades enteras y positivas`
        )
      )

    const newCart = await cartsService.create(products)

    response.sendSuccess({
      message: 'El carrito fue creado correctamente',
      newCart: newCart,
    })
  }

  addProductToCart = async (request, response) => {
    try {
      const { cid, pid } = request.params
      const quantity = request.body.quantity

      request.headers.internalRequest = true

      //Llamo a getProductById aclarandole al método que el pedido es de parte del server. De esta forma evito que mi api quiera enviar dos respuestas distintas al cliente.
      const productFound = await getProductById(request, response)

      if (!productFound)
        return response.sendUserError(
          new Error(`No existe un producto cuyo ID sea: ${request.params.pid}`)
        )

      //Valido que la cantidad sea un número entero y positivo
      if (!Number.isInteger(quantity) || quantity < 0)
        return response.sendUserError(
          new Error(
            'La cantidad del producto a agregar debe ser un valor entero y positivo'
          )
        )

      //Si ya existía el producto en el carrito
      //Con upsert le indico que si no se encontró un documento que cumpla con el criterio de búsqueda, que inserte uno nuevo que cumpla con los parámetros indicados en el update
      let updatedCart = await cartsService.update(
        {
          _id: cid,
          'products.product': pid,
        },
        { $inc: { 'products.$.quantity': quantity } },
        true
      )

      if (updatedCart) return response.sendSuccess({ cart: updatedCart })

      //Si no existía el producto en el carrito
      updatedCart = await cartsService.update(
        { _id: cid },
        { $push: { products: { product: pid, quantity: quantity } } }
      )

      response.sendSuccess({ cart: updatedCart })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  updateCartProducts = async (request, response) => {
    try {
      const { cid, pid } = request.params
      const products = request.body.products

      request.headers.internalRequest = true
      const storedProducts = await getProducts(request, response)
      const missingProducts = []

      //TODO: Agregar validación para que no se pueda ingresar el mismo producto dos veces

      //Valido que los productos que recibí por parámetro existan en mi colección de productos
      for (const productToValidate of products) {
        let productFound = storedProducts.find((storedProduct) => {
          let isValidProduct =
            storedProduct._id.toString() ===
            productToValidate.product.toString()

          let isValidQuantity =
            Number.isInteger(productToValidate.quantity) &&
            productToValidate.quantity > 0

          return isValidProduct && isValidQuantity
        })

        if (!productFound) {
          missingProducts.push(productToValidate.product)
        }
      }

      if (missingProducts.length > 0)
        return response.sendUserError(
          new Error(
            `Los siguientes productos no existen en la base de datos o bien fueron ingresados con cantidades negativas/decimales: ${missingProducts.join(
              ', '
            )}. La operación será realizada solo si existen todos los productos enviados y los mismos se ingresan con cantidades enteras y positivas`
          )
        )

      const updatedCart = await cartsService.update(
        { _id: cid },
        { $set: { products: products } }
      )

      if (!updatedCart)
        return response.sendUserError(
          new Error('No existe un carrito con el ID proporcionado')
        )

      response.sendSuccess({ updatedCart: updatedCart })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  updateProductQuantity = async (request, response) => {
    try {
      const { cid, pid } = request.params
      const quantity = request.body.quantity

      request.headers.internalRequest = true
      //Llamo a getProductById aclarandole al método que el pedido es de parte del server. De esta forma evito que mi api quiera enviar dos respuestas distintas al cliente.
      const productFound = await getProductById(request, response)

      if (!productFound)
        return response.sendUserError(
          new Error(`No existe un producto cuyo ID sea: ${request.params.pid}`)
        )

      //Valido que la cantidad sea un número entero y positivo
      if (!Number.isInteger(quantity) || quantity < 0)
        return response.sendUserError(
          new Error(
            'La cantidad del producto a agregar debe ser un valor entero y positivo'
          )
        )

      const updatedCart = await cartsService.update(
        { _id: cid, 'products.product': pid },
        { $set: { 'products.$.quantity': quantity } }
      )

      if (!updatedCart)
        return response.sendUserError(
          new Error('No existe un carrito con el ID proporcionado')
        )

      response.sendSuccess({ updatedCart: updatedCart })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  deleteProductFromCart = async (request, response) => {
    try {
      const { cid, pid } = request.params

      const updatedCart = await cartsService.update(
        { _id: cid, 'products.product': pid },
        { $pull: { products: { product: pid } } }
      )

      if (!updatedCart)
        return response.sendUserError(
          new Error(
            `No existe un carrito cuyo ID sea ${cid} y que contenga el producto cuyo ID es ${pid}`
          )
        )

      response.sendSuccess({ updatedCart: updatedCart })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  emptyCart = async (request, response) => {
    try {
      const cid = request.params.cid

      const emptyCart = await cartsService.update(
        { _id: cid },
        { $set: { products: [] } },
        { new: true }
      )

      if (!emptyCart) {
        return response.sendUserError(
          new Error('No existe un carrito con el ID proporcionado')
        )
      }

      response.sendSuccess({ emptyCart: emptyCart })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  deleteCart = async (request, response) => {
    const cid = request.params.cid

    const deletedCart = await cartsService.delete(cid)

    if (!deletedCart) {
      return response.sendUserError(
        new Error('No existe un carrito con el ID proporcionado')
      )
    }

    response.sendSuccess({
      messge: 'El carrito fue eliminado correctamente',
      deletedCart: deletedCart,
    })
  }
}

module.exports = new CartController()