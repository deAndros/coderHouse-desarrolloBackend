const CustomRouter = require('./customRouter.class.js')
const {
  productsService,
  usersService,
  cartsService,
} = require('../services/index')
const { redirectToSendEmail } = require('../utils/jwt')

class ViewsRouter extends CustomRouter {
  init() {
    this.get(
      '/products',
      ['USER', 'ADMIN', 'PREMIUM'],
      async (request, response) => {
        try {
          const { docs } = await productsService.get()
          const products = docs
          const loggedUserData = request.user
          console.log(loggedUserData.cart)

          response.render('products', {
            products,
            loggedUserData,
            style: 'products.css',
          })
        } catch (error) {
          response.render('products', error.message)
        }
      }
    )

    this.get(
      '/cart',
      ['USER', 'ADMIN', 'PREMIUM'],
      async (request, response) => {
        try {
          const loggedUserData = request.user
          const cartProducts = await cartsService.getById(loggedUserData.cart)

          response.render('cart', {
            cartProducts,
            loggedUserData,
            style: 'cart.css',
          })
        } catch (error) {
          response.render('cart', error.message)
        }
      }
    )

    this.get('/users', ['ADMIN'], async (request, response) => {
      try {
        let page = parseInt(request.query.page) || 1
        const limit = parseInt(request.query.limit) || 10
        const sortField = request.query.sortField || 'email'
        const sortOrder = request.query.sortOrder || 'asc'
        const token = request.cookies.Authorization
        const sortOptions = { [sortField]: sortOrder }
        const paginationOptions = { page, limit, sort: sortOptions }

        const {
          docs,
          totalPages,
          prevPage,
          nextPage,
          //page,
          hasPrevPage,
          hasNextPage,
          prevLink,
          nextLink,
        } = await usersService.get(paginationOptions)
        const users = docs

        const loggedUserData = request.user
        response.render('users', {
          users,
          loggedUserData,
          totalPages,
          prevPage,
          nextPage,
          //page,
          hasPrevPage,
          hasNextPage,
          prevLink,
          nextLink,
          token,
          style: 'users.css',
        })
      } catch (error) {
        response.render('users', error.message)
      }
    })

    this.get(
      '/chat',
      ['USER', 'PREMIUM', 'ADMIN'],
      async (request, response) => {
        try {
          const loggedUserData = request.user
          response.render('chat', {
            loggedUserData,
            style: 'chat.css',
          })
        } catch (error) {
          response.render('chat', error.message)
        }
      }
    )

    this.get('/realtimeproducts', (request, response) => {
      response.render('realTimeProducts', { style: 'index.css' })
    })

    this.get('/login', ['PUBLIC'], (request, response) => {
      response.render('login', {
        style: 'login.css',
      })
    })
    this.get('/', ['PUBLIC'], (request, response) => {
      response.render('login', {
        style: 'login.css',
      })
    })

    this.get('/register', ['PUBLIC'], (request, response) => {
      response.render('register', {
        style: 'register.css',
      })
    })

    this.get('/sendRestorationEmail', ['PUBLIC'], (request, response) => {
      let renderingConfig = {
        style: 'send-restoration-email.css',
        message: request.query.warning
          ? 'El link al que intentó acceder ha expirado'
          : '',
      }

      response.render('sendRestorationEmail', renderingConfig)
    })

    this.get(
      '/emailSent',
      ['USER', 'PREMIUM', 'ADMIN'],
      (request, response) => {
        const { email } = request.user
        response.render('emailSent', { style: 'email-sent.css', email })
      }
    )

    this.get(
      '/enterNewPassword',
      ['USER', 'PREMIUM', 'ADMIN'],
      redirectToSendEmail,
      (request, response) => {
        let renderingConfig = {
          style: 'enter-new-password.css',
          message: request.query.warning
            ? 'La contraseña ingresada es idéntica a la contraseña actual, por favor ingrese una nueva'
            : '',
        }
        response.render('enterNewPassword', renderingConfig)
      }
    )

    this.get(
      '/passwordRestored',
      ['USER', 'PREMIUM', 'ADMIN'],
      (request, response) => {
        response.render('passwordrestored', {
          style: 'password-restored.css',
        })
      }
    )
  }
}

module.exports = new ViewsRouter()
