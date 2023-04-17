const { Router } = require("express");
const router = Router();
const ProductManager = require("../classes/ProductManager.class.js");
const productManager = new ProductManager("./src/files/storedProducts.json");

router.get("/home", async (request, response) => {
  try {
    const products = await productManager.getProducts();
    response.render("home", { products, style: "index.css" });
  } catch (error) {
    response.render("home", error.message);
  }
});

router.get("/realtimeproducts", (request, response) => {
  response.render("realTimeProducts", { style: "index.css" });
});

module.exports = router;
