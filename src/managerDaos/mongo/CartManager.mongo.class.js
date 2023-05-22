const cartModel = require('./models/cart.model');
const ProductManagerMongo = require('./ProductManager.mongo.class.js');
const productManagerMongo = new ProductManagerMongo();

class CartManagerMongo {
  getCarts = async () => {
    try {
      const carts = await cartModel.find({}).populate('products.product');
      return carts;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getCartById = async (cartId) => {
    try {
      const cart = await cartModel.find({ _id: cartId });

      if (cart.length === 0) {
        throw new Error('No existe un carrito con el ID seleccionado');
      }

      return cart;
    } catch (error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else {
        throw new Error(error.message);
      }
    }
  };

  addProductToCart = async (cartId, productId, quantity) => {
    try {
      //Ejecuto este método para validar que exista el producto ingresado por parámetro
      await productManagerMongo.getProductById(productId);

      //Valido que la cantidad sea un número entero y positivo
      if (!Number.isInteger(quantity) || quantity < 0) {
        console.log('La cantidad debe ser un número entero positivo.');
        return;
      }

      //Si ya existía el producto en el carrito
      //Con upsert le indico que si no se encontró un documento que cumpla con el criterio de búsqueda, que inserte uno nuevo que cumpla con los parámetros indicados en el update
      let updatedCart = await cartModel.findOneAndUpdate(
        {
          _id: cartId,
          'products.product': productId,
        },
        { $inc: { 'products.$.quantity': quantity } },
        { new: true },
        { upsert: true }
      );

      if (updatedCart) {
        return updatedCart;
      }

      //Si no existía el producto en el carrito
      updatedCart = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { $push: { products: { product: productId, quantity } } },
        { new: true }
      );

      return updatedCart;
    } catch (error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else {
        throw new Error(error.message);
      }
    }
  };

  updateCartProducts = async (cartId, products) => {
    try {
      //Primero valido si los productos recibidos por parámetro existen en mi colección de productos
      const storedProducts = await productManagerMongo.getProducts();
      const missingProducts = [];

      for (const productToValidate of products) {
        let productFound = storedProducts.docs.find((storedProduct) => {
          return (
            storedProduct._id.toString() ===
            productToValidate.product.toString()
          );
        });

        if (!productFound) {
          missingProducts.push(productToValidate.product);
        }
      }

      if (missingProducts.length > 0) {
        const missingProductsString = missingProducts.join(', ');
        throw new Error(
          `Los siguientes productos no existen en la base de datos: ${missingProductsString}`
        );
      }

      const updatedCart = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { $set: { products: products } },
        { new: true }
      );

      return updatedCart;
    } catch (error) {
      if (
        error.message.includes('Cast to ObjectId failed') &&
        error.message.includes('for model "carts"')
      ) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else if (
        error.message.includes('Cast to ObjectId failed') &&
        error.message.includes('for model "products"')
      ) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else {
        throw new Error(error.message);
      }
    }
  };

  updateProductQuantity = async (cartId, productId, quantity) => {
    try {
      //Ejecuto este método para validar que exista el producto ingresado por parámetro
      await productManagerMongo.getProductById(productId);

      //Valido que la cantidad sea un número entero y positivo
      if (!Number.isInteger(quantity) || quantity < 0) {
        console.log('La cantidad debe ser un número entero positivo.');
        return;
      }

      const updatedCart = await cartModel.findOneAndUpdate(
        { _id: cartId, 'products.product': productId },
        { $set: { 'products.$.quantity': quantity } },
        { new: true }
      );

      if (!updatedCart) {
        throw new Error('No existe un carrito con el ID proporcionado');
      }

      return updatedCart;
    } catch (error) {
      if (
        error.message.includes('Cast to ObjectId failed') &&
        error.message.includes('for model "carts"')
      ) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else if (
        error.message.includes('Cast to ObjectId failed') &&
        error.message.includes('for model "products"')
      ) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else {
        throw new Error(error.message);
      }
    }
  };

  deleteProductFromCart = async (cartId, productId) => {
    try {
      const [cartFound] = await this.getCartById(cartId);

      /* Para acceder a los productos de un carrito usando el destructuring nomenclado con []
      console.log(cartFound.products);*/

      const productFound = await cartModel.find({
        _id: cartId,
        'products.product': productId,
      });

      if (!cartFound) {
        throw new Error('No existe un CARRITO con el ID proporcionado');
      }

      if (productFound.length === 0) {
        throw new Error('No existe un PRODUCTO con el ID proporcionado');
      }

      const updatedCart = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { $pull: { products: { product: productId } } },
        { new: true }
      );

      return updatedCart;
    } catch (error) {
      if (
        error.message.includes('Cast to ObjectId failed') ||
        error.message.includes('for model "carts"')
      ) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else {
        throw new Error(error.message);
      }
    }
  };

  emptyCart = async (cartId) => {
    try {
      const emptyCart = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { $set: { products: [] } },
        { new: true }
      );

      if (!emptyCart) {
        throw new Error('No existe un carrito con el ID proporcionado');
      }

      return emptyCart;
    } catch (error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('No se encontró un carrito con el ID proporcionado');
      } else {
        throw new Error(error.message);
      }
    }
  };

  addCart = async () => {
    try {
      const newCart = await cartModel.create({ products: [] });
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

module.exports = CartManagerMongo;
