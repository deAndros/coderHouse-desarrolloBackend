const { Router } = require("express");
const router = Router();

const ProductManager = require("../classes/ProductManager.class.js");
const productManager = new ProductManager("./src/files/storedProducts.json");
const Product = require("../classes/Product.class.js");

router.get("/", async (request, response) => {
  try {
    const products = await productManager.getProducts();
    //Valido que el limit se haya enviado por parámetro y que sea un valor numérico entero
    if (
      request.query.hasOwnProperty("limit") &&
      !isNaN(parseInt(request.query.limit))
    )
      return response.send({
        products: products.slice(0, parseInt(request.query.limit)),
      });

    response.send({ products: products });
  } catch (error) {
    return response.status(400).send({
      error: error.message,
    });
  }
});

router.get("/:id", async (request, response) => {
  const id = parseInt(request.params.id);

  if (isNaN(id) || !id) {
    return response.status(400).send({
      error: "El id proporcionado debe ser un número entero y positivo",
    });
  }

  try {
    const product = await productManager.getProductById(request.params.id);
    response.send({ message: "Producto hallado", product: product });
  } catch (error) {
    return response.status(400).send({
      error: error.message,
    });
  }
});

router.post("/", async (request, response) => {
  if (Object.keys(request.body).length === 0)
    return response.status(400).send({ error: "No se encontró post-data" });

  if (request.body.id)
    return response
      .status(400)
      .send({ error: "No se permite ingresar el campo id" });

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
    await productManager.addProduct(productToAdd);
  } catch (error) {
    return response.status(400).send({
      status: 400,
      message: "Se produjo un error al agregar el producto",
      error: error.message,
    });
  }

  response
    .status(200)
    .send({ status: 200, message: "El producto se agregó correctamente" });

  //TODO: Agregar una validación para que el objeto que se envía por body solo pueda tener las keys: [title, code, stock, description, price, thumbnail]
});

//TODO: No llega el mensaje de error cuando se ingresa el ID de un producto no existente
router.put("/:id", async (request, response) => {
  const id = parseInt(request.params.id);

  if (isNaN(id) || !id) {
    return response.status(400).send({
      error: "El id proporcionado debe ser un número entero y positivo",
    });
  }

  try {
    updatedProduct = await productManager.updateProduct(id, request.body);

    response.status(200).send({
      message: "El producto se actualizó correctamente",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.delete("/:id", async (request, response) => {
  const id = parseInt(request.params.id);

  if (isNaN(id) || !id) {
    return response.status(400).send({
      error: "El id proporcionado debe ser un número entero y positivo",
    });
  }

  try {
    deletedProduct = await productManager.deleteProduct(id);

    response.status(200).send({
      message: "El producto se eliminó correctamente",
      deletedProduct: deletedProduct,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

module.exports = router;
