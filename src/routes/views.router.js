const { Router } = require('express')
const router = Router()
const { productsService } = require('../services/index')
const { passportAuth } = require('../middlewares/passportAuthentication')
const {
  passportAuthorization,
} = require('../middlewares/passportAuthorization')

router.get(
  '/products',
  passportAuth('jwt'),
  passportAuthorization('Admin'),
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

router.get('/restorePassword', (request, response) => {
  response.render('restorePassword', { style: 'index.css' })
})

module.exports = router
