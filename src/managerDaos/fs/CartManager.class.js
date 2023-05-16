const Cart = require('../../classes/Cart.class.js');
const ProductManager = require('./ProductManager.class.js');
const productManager = new ProductManager('./src/files/storedProducts.json');

const fs = require('fs');

//path sugerido: "./files/storedCarts.json"

class CartManager {
  static idCounter;

  constructor(path) {
    this.path = path;
  }

  fetchStoredCarts = async () => {
    try {
      const carts = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
      CartManager.idCounter = carts.length;

      return carts;
    } catch (error) {
      //Si no encontró carritos, retorna un arreglo vacío
      console.log(error.message);
      return [];
    }
  };

  getCarts = async () => {
    try {
      const carts = await this.fetchStoredCarts();
      return carts;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getCartById = async (cartId, callSource) => {
    try {
      const carts = await this.fetchStoredCarts();
      const cartFound = carts.find((cart) => cart.id === cartId);

      if (!cartFound && callSource === 'client')
        throw new Error('No existe un carrito con el ID seleccionado');
      else if (!cartFound && callSource === 'server')
        return { id: cartId, products: [] };

      return cartFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  addProductToCart = async (cartId, productId) => {
    try {
      const cartFound = await this.getCartById(cartId, 'server');
      await productManager.getProductById(productId);

      const newCart = new Cart(cartId);
      newCart.products = cartFound.products;
      await this.deleteCart(cartId);
      const carts = await this.fetchStoredCarts();
      await newCart.addProduct(productId);
      carts.push(newCart);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(carts, null, 2),
        'utf-8'
      );

      return newCart;
    } catch (error) {
      if (error.name === 'cartNotFound')
        throw new Error('El carrito ingresado no existe');

      throw new Error(error.message);
    }
  };

  //TODO: Falta exponerlo
  deleteProductFromCart = async (cartId, productId) => {
    try {
      const cartFound = await getCartById(cartId);
      await productManager.productById(productId);
      const newCart = new Cart(cartId);
      newCart.products = cartFound.products;
      await newCart.deleteProduct(productId);
      const carts = await this.fetchStoredCarts();

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(carts, null, 2),
        'utf-8'
      );

      return cartFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  addCart = async () => {
    try {
      const carts = await this.fetchStoredCarts();
      CartManager.idCounter = CartManager.idCounter + 1;
      const newCart = new Cart(CartManager.idCounter);
      carts.push(newCart);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(carts, null, 2),
        'utf-8'
      );

      return newCart;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  //TODO: Falta probarlo y exponerlo
  deleteCart = async (cartId) => {
    let carts = await this.fetchStoredCarts();
    const objectIndex = carts.findIndex((cart) => cart.id === cartId);

    if (objectIndex === -1) {
      const cartNotFound = new Error(
        'No existe el carrito que se desea eliminar'
      );
      cartNotFound.name = 'cartNotFound';
      throw cartNotFound;
    }

    carts = carts.filter((cart) => cart.id !== cartId);

    await fs.promises.writeFile(
      this.path,
      JSON.stringify(carts, null, 2),
      'utf-8'
    );
    return true;
  };
}

module.exports = CartManager;
