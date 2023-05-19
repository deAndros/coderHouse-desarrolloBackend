const { Router } = require('express');
const router = Router();
const ProductManagerMongo = require('../managerDaos/mongo/ProductManager.mongo.class');
const productManagerMongo = new ProductManagerMongo();
const { auth } = require('../middlewares/authentication.middleware');

router.get('/products', auth, async (request, response) => {
  try {
    const products = await productManagerMongo.getProducts();
    const loggedUserData = request.session.user;
    response.render('products', {
      products,
      loggedUserData,
      style: 'index.css',
    });
  } catch (error) {
    response.render('products', error.message);
  }
});

router.get('/realtimeproducts', (request, response) => {
  response.render('realTimeProducts', { style: 'index.css' });
});

router.get('/login', (request, response) => {
  response.render('login', {
    style: 'index.css',
  });
});

router.get('/register', (request, response) => {
  response.render('register', {
    style: 'index.css',
  });
});

module.exports = router;
