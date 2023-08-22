const { Router } = require('express')
const CustomRouter = require('./customRouter.class.js')
const { productsService } = require('../services/index')
const { passportAuth } = require('../middlewares/passportAuthentication')
const {
  passportAuthorization,
} = require('../middlewares/passportAuthorization')
const { redirectToSendEmail } = require('../utils/jwt')

class ViewsRouter extends CustomRouter {
  init() {
    this.get(
      '/products',
      ['IGNORE'],
      passportAuth('jwt'),
      passportAuthorization(['USER', 'ADMIN', 'PREMIUM']),
      async (request, response) => {
        try {
          const { docs } = await productsService.get()
          const products = docs
          const loggedUserData = request.user.user

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

    this.get('/realtimeproducts', (request, response) => {
      response.render('realTimeProducts', { style: 'index.css' })
    })

    this.get('/login', ['IGNORE'], (request, response) => {
      response.render('login', {
        style: 'login.css',
      })
    })
    this.get('/', ['IGNORE'], (request, response) => {
      response.render('login', {
        style: 'login.css',
      })
    })

    this.get('/register', ['IGNORE'], (request, response) => {
      response.render('register', {
        style: 'register.css',
      })
    })

    this.get('/sendRestorationEmail', ['IGNORE'], (request, response) => {
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
      ['IGNORE'],
      passportAuth('jwt'),
      (request, response) => {
        const { email } = request.user.user
        response.render('emailSent', { style: 'email-sent.css', email })
      }
    )

    this.get(
      '/enterNewPassword',
      ['IGNORE'],
      redirectToSendEmail,
      passportAuth('jwt'),
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
      ['IGNORE'],
      passportAuth('jwt'),
      (request, response) => {
        response.render('passwordrestored', {
          style: 'password-restored.css',
        })
      }
    )
  }
}

module.exports = new ViewsRouter()
