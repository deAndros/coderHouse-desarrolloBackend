const { Router } = require('express')
const router = Router()
const { productsService } = require('../services/index')
const { passportAuth } = require('../middlewares/passportAuthentication')
const {
  passportAuthorization,
} = require('../middlewares/passportAuthorization')

//TODO: Aplicar CUSTOM ROUTER acá
router.get(
  '/products',
  passportAuth('jwt'),
  passportAuthorization(['USER', 'ADMIN']),
  async (request, response) => {
    try {
      const { docs } = await productsService.get()
      const products = docs
      const loggedUserData = request.user.user

      response.render('products', {
        products,
        loggedUserData,
        style: 'index.css',
      })
    } catch (error) {
      response.render('products', error.message)
    }
  }
)

router.get('/realtimeproducts', (request, response) => {
  response.render('realTimeProducts', { style: 'index.css' })
})

router
  .get('/login', (request, response) => {
    response.render('login', {
      style: 'index.css',
    })
  })
  .get('/', (request, response) => {
    response.render('login', {
      style: 'index.css',
    })
  })

router.get('/register', (request, response) => {
  response.render('register', {
    style: 'index.css',
  })
})

router.get('/sendRestorationEmail', (request, response) => {
  response.render('sendRestorationEmail', {
    style: 'index.css',
  })
})

router.get('/emailSent', passportAuth('jwt'), (request, response) => {
  const { email } = request.user.user
  response.render('emailSent', { style: 'index.css', email })
})

router.get('/enterNewPassword', passportAuth('jwt'), (request, response) => {
  let renderingConfig = {
    style: 'index.css',
    message: request.query.warning
      ? 'La contraseña ingresada es idéntica a la contraseña actual, por favor ingrese una nueva'
      : '',
  }
  response.render('enterNewPassword', renderingConfig)
})

router.get('/passwordRestored', passportAuth('jwt'), (request, response) => {
  response.render('passwordrestored', {
    style: 'index.css',
  })
})

module.exports = router
