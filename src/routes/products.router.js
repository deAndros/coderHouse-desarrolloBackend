const { Router } = require('express');
const router = Router();

const ProductManagerMongo = require('../managerDaos/mongo/ProductManager.mongo.class.js');
const productManagerMongo = new ProductManagerMongo();
const Product = require('../classes/Product.class.js');

router.get('/', async (request, response) => {
  //TODO: Agregar las agregaciones para filtrar por category y status
  try {
    const { limit, page, sort } = request.query;

    let { docs, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage } =
      await productManagerMongo.getProducts(limit, page, sort);

    let prevLink;
    let nextLink;

    !hasPrevPage
      ? (prevLink = null)
      : (prevLink = `/api/products?page=${prevPage}&limit=${limit}&sort=${sort}`);

    !hasNextPage
      ? (nextLink = null)
      : (prevLink = `/api/products?page=${nextPage}&limit=${limit}&sort=${sort}`);

    response.status(200).send({
      status: 'success',
      products: docs,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    return response.status(400).send({
      error: error.message,
    });
  }
});

router.get('/:id', async (request, response) => {
  try {
    const product = await productManagerMongo.getProductById(request.params.id);
    response.send({ message: 'Producto hallado', product: product });
  } catch (error) {
    return response.status(400).send({
      error: error.message,
    });
  }
});

router.post('/', async (request, response) => {
  if (Object.keys(request.body).length === 0)
    return response.status(400).send({ error: 'No se encontró post-data' });

  let productToAdd = new Product(
    request.body.title,
    request.body.code,
    request.body.stock,
    request.body.description,
    request.body.price,
    request.body.status,
    request.body.category,
    request.body.thumbnails
  );

  try {
    await productManagerMongo.addProduct(productToAdd);
  } catch (error) {
    return response.status(400).send({
      status: 400,
      message: 'Se produjo un error al agregar el producto',
      error: error.message,
    });
  }

  response
    .status(200)
    .send({ status: 200, message: 'El producto se agregó correctamente' });
});

router.put('/:id', async (request, response) => {
  try {
    const updatedProduct = await productManagerMongo.updateProduct(
      request.params.id,
      request.body
    );

    response.status(200).send({
      message: 'El producto se actualizó correctamente',
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.delete('/:id', async (request, response) => {
  try {
    deletedProduct = await productManagerMongo.deleteProduct(request.params.id);

    response.status(200).send({
      message: 'El producto se eliminó correctamente',
      deletedProduct: deletedProduct,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

module.exports = router;
