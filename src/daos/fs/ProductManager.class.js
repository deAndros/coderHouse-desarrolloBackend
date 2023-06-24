const fs = require('fs');

//path sugerido: "./files/storedProducts.json"

class ProductManager {
  static idCounter;

  constructor(path) {
    this.path = path;
  }

  fetchStoredProducts = async () => {
    try {
      const products = JSON.parse(
        await fs.promises.readFile(this.path, 'utf-8')
      );
      ProductManager.idCounter = products.length;

      return products;
    } catch (error) {
      //Si no encontró productos, retorna un arreglo vacío
      console.log(error.message);
      return [];
    }
  };

  getProducts = async () => {
    try {
      const products = await this.fetchStoredProducts();
      return products;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getProductById = async (id) => {
    id = parseInt(id);

    try {
      const products = await this.fetchStoredProducts();
      const productFound = products.find((product) => product.id === id);

      if (!productFound)
        throw new Error('No existe un producto con el ID seleccionado');

      return productFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  addProduct = async (product) => {
    const products = await this.fetchStoredProducts();
    const code = product.code;
    const productFound = products.find((element) => element.code === code);

    if (productFound) {
      throw new Error(
        `El código ${product.code} ya se encuentra utilizado por otro producto.`
      );
    }

    ProductManager.idCounter = ProductManager.idCounter + 1;
    product.setId(ProductManager.idCounter);
    products.push(product);

    await fs.promises.writeFile(
      this.path,
      JSON.stringify(products, null, 2),
      'utf-8'
    );

    return true;
  };

  updateProduct = async (id, properties) => {
    try {
      const productToBeUpdated = await this.getProductById(id);
      const updatedProduct = { ...productToBeUpdated, ...properties };
      await this.deleteProduct(id);
      const products = await this.fetchStoredProducts();

      products.push(updatedProduct);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, 2),
        'utf-8'
      );

      return updatedProduct;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  deleteProduct = async (id) => {
    let products = await this.fetchStoredProducts();
    const objectIndex = products.findIndex((product) => product.id === id);

    if (objectIndex === -1) {
      throw new Error('No existe el producto que se desea eliminar');
    }

    //products = products.splice(objectIndex, 1);
    products = products.filter((product) => product.id !== id);
    await fs.promises.writeFile(
      this.path,
      JSON.stringify(products, null, 2),
      'utf-8'
    );
    return true;
  };
}

module.exports = ProductManager;
