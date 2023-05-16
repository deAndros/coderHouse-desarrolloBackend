const { Router } = require('express');
const router = Router();

const CartManagerMongo = require('../managerDaos/mongo/CartManager.mongo.class.js');
const cartManagerMongo = new CartManagerMongo();

router.get('/', async (request, response) => {
  try {
    const carts = await cartManagerMongo.getCarts();
    response.status(200).send({ carts: carts });
  } catch (error) {
    throw new Error(error.message);
  }
});

router.get('/:id', async (request, response) => {
  try {
    const cartFound = await cartManagerMongo.getCartById(request.params.id);
    response
      .status(200)
      .send({ status: 'success', message: 'Carrito hallado', cart: cartFound });
  } catch (error) {
    response.status(401).send({ status: 'error', error: error.message });
  }
});

router.post('/', async (request, response) => {
  try {
    const newcart = await cartManagerMongo.createCart();
    response.status(200).send({
      status: 'success',
      message: 'Carrito creado exitosamente',
      cartId: newcart.id,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.post('/:cid/product/:pid', async (request, response) => {
  try {
    const { cid, pid } = request.params;
    const { quantity } = request.body;
    const cart = await cartManagerMongo.addProductToCart(cid, pid, quantity);

    response.status(200).send({
      message: 'Producto agregado correctamente',
      cart: cart,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.put('/:cid', async (request, response) => {
  try {
    const cid = request.params.cid;
    const products = request.body.products;
    const updatedCart = await cartManagerMongo.updateCartProducts(
      cid,
      products
    );
    response.status(200).send({
      status: 'success',
      message: 'Productos actualizados correctamente',
      cart: updatedCart,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.put('/:cid/product/:pid', async (request, response) => {
  try {
    const { cid, pid } = request.params;
    const { quantity } = request.body;

    const updatedCart = await cartManagerMongo.updateProductQuantity(
      cid,
      pid,
      quantity
    );

    response.status(200).send({
      status: 'success',
      message: 'Producto actualizado correctamente',
      cart: updatedCart,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.delete('/:cid/product/:pid', async (request, response) => {
  try {
    const { cid, pid } = request.params;

    const updatedCart = await cartManagerMongo.deleteProductFromCart(cid, pid);

    response.status(200).send({
      status: 'success',
      message: 'Producto eliminado correctamente',
      cart: updatedCart,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.delete('/:cid', async (request, response) => {
  try {
    const cid = request.params.cid;
    const emptyCart = await cartManagerMongo.emptyCart(cid);

    response
      .status(200)
      .send({ status: 'success', message: 'Carrito vaciado', cart: emptyCart });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = router;
