const { Router } = require('express')
const viewsRouter = require('./views.router')
const productsRouter = require('./products.router')
const cartsRouter = require('./carts.router')
const sessionsRouter = require('./sessions.router')

const router = Router()

//_________________Apartado de VISTAS_________________
router.use('/', viewsRouter)

//_________________Apartado de PRODUCTOS_________________
router.use('/api/products', productsRouter)

//_________________Apartado de CARRITOS_________________
//TODO: Exponer las rutas para los endpoints que faltan
router.use('/api/carts', cartsRouter)

//_________________Apartado de SESIONES_________________
router.use('/api/sessions', sessionsRouter)

/*//_________________Rutas Indefinidas_________________
router.get('*', async (request, response) => {
  response.status(404).send('404 Not Found')
})*/

module.exports = router
