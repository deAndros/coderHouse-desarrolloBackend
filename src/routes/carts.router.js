const { Router } = require("express");
const router = Router();

const CartManager = require("../classes/CartManager.class.js");
const cartManager = new CartManager("./src/files/storedCarts.json");
const ProductManager = require("../classes/ProductManager.class.js");
const productManager = new ProductManager("./src/files/storedProducts.json");

router.post("/", async (request, response) => {
  try {
    const newcart = await cartManager.addCart();
    response
      .status(200)
      .send({ message: "Carrito creado exitosamente", cartId: newcart.id });
  } catch (error) {
    response.status(400).send({ error: error.message });
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
    const cartFound = await cartManager.getCartById(id);
    response.status(200).send({ message: "Carrito hallado", cart: cartFound });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

router.post("/:cid/product/:pid", async (request, response) => {
  const cid = parseInt(request.params.cid);
  const pid = parseInt(request.params.pid);

  if (isNaN(cid) || !cid) {
    return response.status(400).send({
      error: "El id del carrito debe ser un número entero y positivo",
    });
  }

  if (isNaN(pid) || !pid) {
    return response.status(400).send({
      error: "El id del producto debe ser un número entero y positivo",
    });
  }

  try {
    //Invoco los getters de Cart y Product para validar que ambos existan
    await cartManager.getCartById(cid);
    await productManager.getProductById(pid);

    const newCart = await cartManager.addProductToCart(cid, pid);

    response.status(200).send({
      message: "Producto agregado correctamente",
      cart: newCart,
    });
  } catch (error) {
    response.status(400).send({ error: error.message });
  }
});

module.exports = router;
