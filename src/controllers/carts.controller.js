const { getProducts, getProductById } = require('./products.controller')
const {
  cartsService,
  productsService,
  usersService,
} = require('../services/index')
const ticketModel = require('../daos/mongo/models/ticket.model')
const { sendEmail } = require('../utils/emailSender')
const { sendSms, sendWhatsapp } = require('../utils/smsSender')

class CartController {
  getCarts = async (request, response) => {
    try {
      let { limit = 1000, page = 1, sort = 'asc' } = request.query
      const result = await cartsService.get()

      let { docs, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage } =
        result

      let prevLink
      let nextLink

      !hasPrevPage
        ? (prevLink = null)
        : (prevLink = `/api/carts?page=${prevPage}&limit=${limit}&sort=${sort}`)

      !hasNextPage
        ? (nextLink = null)
        : (nextLink = `/api/carts?page=${nextPage}&limit=${limit}&sort=${sort}`)

      response.sendSuccess({
        carts: docs,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  getCartById = async (request, response) => {
    try {
      const cart = await cartsService.getById(request.params.cid)

      if (!cart)
        return response.sendBadRequest(
          new Error(`No existe un carrito con el id ${request.params.cid}`)
        )

      response.sendSuccess({ cart: cart })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  createCart = async (request, response) => {
    const products = request.body.products ? request.body.products : []

    request.headers.internalRequest = true

    const storedProducts = await getProducts(request, response)
    const missingProducts = []

    //TODO: Agregar validación para que no se pueda ingresar el mismo producto dos veces

    if (products.length > 0) {
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
        return response.sendBadRequest(
          new Error(
            `Los siguientes productos no existen en la base de datos o bien fueron ingresados con cantidades negativas/decimales: ${missingProducts.join(
              ', '
            )}. La operación será realizada solo si existen todos los productos enviados y los mismos se ingresan con cantidades enteras y positivas`
          )
        )
    }

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
      const productFound = await productsService.getById(pid)

      if (!productFound)
        return response.sendBadRequest(
          new Error(`No existe un producto cuyo ID sea: ${pid}`)
        )

      //Valido que la cantidad sea un número entero y positivo
      if (!Number.isInteger(quantity) || quantity < 0)
        return response.sendBadRequest(
          new Error(
            'La cantidad del producto a agregar debe ser un valor entero y positivo'
          )
        )

      const requestUser = await usersService.getByEmail(request.user.email)

      if (productFound.owner === requestUser.email) {
        console.log('No puede agregar al carrito un producto creado por usted')
        return response.sendBadRequest(
          new Error('No puede agregar al carrito un producto creado por usted')
        )
      }

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
      response.sendInternalServerError(error)
    }
  }

  updateCartProducts = async (request, response) => {
    try {
      const cid = request.params.cid
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
        return response.sendBadRequest(
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
        return response.sendBadRequest(
          new Error('No existe un carrito con el ID proporcionado')
        )

      response.sendSuccess({ updatedCart: updatedCart })
    } catch (error) {
      next()
    }
  }

  updateProductQuantity = async (request, response) => {
    try {
      const { cid, pid } = request.params
      const quantity = parseInt(request.body.quantity)

      request.headers.internalRequest = true
      //TODO: Modificar, usar el service en su lugar
      //Llamo a getProductById aclarandole al método que el pedido es de parte del server. De esta forma evito que mi api quiera enviar dos respuestas distintas al cliente.
      const productFound = await getProductById(request, response)

      console.log(productFound)
      if (!productFound)
        return response.sendBadRequest(
          new Error(`No existe un producto cuyo ID sea: ${request.params.pid}`)
        )

      //Valido que la cantidad sea un número entero y positivo
      if (!Number.isInteger(quantity) || quantity < 0)
        return response.sendBadRequest(
          new Error(
            'La cantidad del producto a agregar debe ser un valor entero y positivo'
          )
        )

      const updatedCart = await cartsService.update(
        { _id: cid, 'products.product': pid },
        { $set: { 'products.$.quantity': quantity } }
      )

      console.log('CARRITO ACTUALIZADO', updatedCart)
      if (!updatedCart)
        return response.sendBadRequest(
          new Error('No existe un carrito con el ID proporcionado')
        )

      response.sendSuccess({ updatedCart: updatedCart })
    } catch (error) {
      response.sendInternalServerError(error)
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
        return response.sendBadRequest(
          new Error(
            `No existe un carrito cuyo ID sea ${cid} y que contenga el producto cuyo ID es ${pid}`
          )
        )

      response.sendSuccess({ updatedCart: updatedCart })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  deleteCart = async (request, response) => {
    const cid = request.params.cid

    const deletedCart = await cartsService.delete(cid)

    if (!deletedCart) {
      return response.sendBadRequest(
        new Error('No existe un carrito con el ID proporcionado')
      )
    }

    response.sendSuccess({
      messge: 'El carrito fue eliminado correctamente',
      deletedCart: deletedCart,
    })
  }

  generateTicket = async (request, response, next) => {
    //Este método toma directamente el carrito del usuario que se encuentra autenticado. No necesita recibirlo como parámetro
    try {
      //Necesito traer el cart aún teniendolo en el JWT para que este se popule y por ende pueda manipular la propiedad "stock"
      const cart = await cartsService.getById(request.user.cart)

      if (!cart) {
        return response.sendBadRequest(
          new Error(
            'El usuario autenticado no posee un carrito inicializado. Contáctese con el administrador.'
          )
        )
      }

      if (cart.products.length === 0) {
        return response.sendBadRequest(
          new Error('El carrito del usuario se encuentra vacío')
        )
      }

      let purchasedProducts = []
      let productsOutOfStock = []
      let totalPrice = 0

      for (const cartItem of cart.products) {
        let updatedProductQuantity = 0

        /*if (request.user.email === cartItem.product.owner)
          return response.sendBadRequest(
            new Error(
              `El producto ${cartItem.product.title} fue creado por usted y por ende no puede avanzar con la compra`
            )
          )*/

        if (
          cartItem.product.stock > 0 &&
          cartItem.product.stock >= cartItem.quantity
        ) {
          updatedProductQuantity = cartItem.product.stock - cartItem.quantity

          if (updatedProductQuantity === 0) {
            await productsService.delete(cartItem.product._id)
          } else {
            await productsService.updateStock(
              cartItem.product._id,
              updatedProductQuantity
            )
          }

          totalPrice += cartItem.product.price * cartItem.quantity
          purchasedProducts.push({
            product: cartItem.product,
            quantity: cartItem.quantity,
          })
        } else {
          productsOutOfStock.push({
            product: cartItem.product._id,
            quantity: cartItem.quantity,
          })
        }
      }

      if (purchasedProducts.length > 0) {
        const ticketTocreate = {
          amount: totalPrice,
          purchaser: request.user.email,
          purchasedProducts: purchasedProducts,
        }

        await cartsService.update(
          { _id: cart._id },
          { $set: { products: productsOutOfStock } }
        )

        const ticket = await ticketModel.create(ticketTocreate)

        let ticketDetail = ''
        purchasedProducts.forEach((item) => {
          ticketDetail += `<tr class="product-info">
                            <td>${item.product.title}</td>
                            <td>${item.product.code}</td>
                            <td>${item.quantity}</td>
                            <td>${item.product.price}</td>
                          </tr>`
        })

        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket de Compra</title>
            <style>
                /* Estilos generales para el correo */
                body {
                    font-family: Arial, sans-serif;
                    background-color: black;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #000;
                    color: white;
                    padding: 20px;
                    border: 2px solid #2b1f9b;
                }
        
                h1 {
                    color: black;
                }
        
                p {
                    margin: 10px 0;
                    color: #4d90fe;
                }
        
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
        
                table, th, td {
                    border: 1px solid #ccc;
                }
        
                th, td {
                    padding: 10px;
                    text-align: center;
                }
        
                .th {
                    background-color: #2778c4;
                    color: white;
                }
        
                /* Estilos para el encabezado del ticket */
                .ticket-header {
                    background-color: #0097a7;
                    color: white;
                    padding: 10px;
                    text-align: center;
                }
        
                /* Estilos para los productos */
                .product-info {
                    background-color: white;
                    padding: 10px;
                    margin-bottom: 10px;
                    color: black;
                }
        
                /* Estilos para el total */
                .total {
                    font-weight: bold;
                }
        
                /* Estilos específicos para el correo */
                .email-container {
                    background-color: #f4f4f4;
                    padding: 20px;
                    border: 2px solid #2b1f9b; /* Agregado: Contorno del correo */
                }
        
                .email-header {
                    background-color: #00bcd4;
                    color: black; /* Cambiado: Color del texto del encabezado */
                    padding: 10px;
                    text-align: center;
                }
        
                .email-content {
                    background-color: #000;
                    padding: 20px;
                }
        
                .email-logo {
                    display: block;
                    margin: 0 auto;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Ticket de Compra</h1>
                </div>
                <div class="email-content">
                    <p>¡Gracias por tu compra!</p>
                    <p>Fecha de Compra: ${new Date().toLocaleDateString(
                      'es-ES'
                    )}</p>
                    <p style="color: #4d90fe;">Productos Comprados:</p>
                    <table>
                        <tr>
                            <th class="th">Título</th>
                            <th class="th">Código del Producto</th>
                            <th class="th">Cantidad</th>
                            <th class="th">Precio Unitario</th>
                        </tr>
                        ${ticketDetail}
                    </table>
        
                    <p class="total">Total Abonado: $${totalPrice}</p>
                </div>
            </div>
        </body>
        </html>`

        //TODO: Buscar formas de utilizar los emails y los sms en otras partes del código, por ejemplo en el registro exitoso
        await sendEmail(request.user.email, '!Compra exitosa!', html)
        //await sendSms(request.user.email)
        //await sendWhatsapp(request.user.email)

        return response.sendSuccess({
          message: '¡Compra exitosa!',
          ticket: ticket,
          //Buscar la manera de notificarle al usuario que algunos productos no se pudieron comprar por falta de stock
          //producstOutOfStock: `La compra de los siguientes productos no pudo llevarse a cabo por falta de stock: ${productsOutOfStock}`,
        })
      } else {
        return response.sendBadRequest({
          message: `La compra no pudo llevarse a cabo porque no había stock de los productos: ${productsOutOfStock}`,
        })
      }
    } catch (error) {
      console.log(error.message)
      response.sendInternalServerError(error.message)
    }
  }
}

module.exports = new CartController()
