const { Router } = require('express');
const viewsRouter = require('./views.router');
const productsRouter = require('./products.router');
const cartsRouter = require('./carts.router');

const router = Router();

//_________________Apartado de VISTAS_________________
router.use('/', viewsRouter);

//_________________Apartado de PRODUCTOS_________________
router.use('/api/products', productsRouter);

//_________________Apartado de CARRITOS_________________
//TODO: Exponer las rutas para los endpoints que faltan
router.use('/api/carts', cartsRouter);

module.exports = router;
