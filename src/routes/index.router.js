const { Router } = require('express')
const viewsRouter = require('./views.router')
const usersRouter = require('./users.router')
const productsRouter = require('./products.router')
const cartsRouter = require('./carts.router')
const SessionsRouter = require('./sessions.router')
const mocksRouter = require('./mocks.router')
const loggerTestRouter = require('./loggerTest.router')

const router = Router()

//_________________Apartado de VISTAS_________________
router.use('/', viewsRouter.getRouter())

//_________________Apartado de PRODUCTOS_________________
router.use('/api/products', productsRouter.getRouter())

//_________________Apartado de CARRITOS_________________
//TODO: Exponer las rutas para los endpoints que faltan
router.use('/api/carts', cartsRouter.getRouter())

//_________________Apartado de SESIONES_________________
router.use('/api/sessions', SessionsRouter.getRouter())

//_________________Apartado de USUARIOS_________________
router.use('/api/users', usersRouter.getRouter())

//_________________Apartado de MOCKS_________________
router.use('/api/mocks', mocksRouter.getRouter())

//_________________Apartado de LOGGER TESTER_________________
router.use('/api/loggerTest', loggerTestRouter.getRouter())

/*//_________________Rutas Indefinidas_________________
router.get('*', async (request, response) => {
  response.status(404).send('404 Not Found')
})*/

module.exports = router
