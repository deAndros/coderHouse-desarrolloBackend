class Cart {
  constructor(cartData) {
    this._id = cartData._id;
    this.products = cartData.products;
  }

  addProduct = async (productId) => {
    const productsArray = this.products;
    console.log('LLEGUÉ y mis productos son:', productsArray);
    //Busco si el producto existe previamente en el carrito
    const productInCartIndex = productsArray.findIndex((element) => {
      {
        return element.productId === productId;
      }
    });

    // Si existe, solo incremento su cantidad
    if (productInCartIndex !== -1) {
      this.products[productInCartIndex].quantity =
        this.products[productInCartIndex].quantity + 1;
    } else {
      // Si no existe...
      this.products.push({ productId, quantity: 1 });
    }
    return this;
  };

  deleteProduct = async (productId) => {
    //Busco si el producto existe previamente en el carrito
    const productInCartIndex = this.products.findIndex(
      (element) => element.productId === productId
    );

    let productQuantity = this.products[productInCartIndex].quantity;
    console.log('productInCartIndex', productInCartIndex);
    console.log('productQuantity', productQuantity);
    // Si existe y hay uno, lo elimino del arreglo
    if (productInCartIndex !== -1 && productQuantity === 1) {
      this.products.splice(productInCartIndex, 1);
      //Si existe y hay más de uno, reduzco su cantidad en 1
    } else if (productInCartIndex !== -1 && productQuantity > 1) {
      this.products[productInCartIndex].quantity =
        this.products[productInCartIndex].quantity - 1;
    } else {
      // Si no existe...
      throw new Error(
        'No se puede eliminar un producto que no esté en el carrito'
      );
    }
    return this;
  };

  getProducts = async () => {
    return this.products;
  };
}

module.exports = Cart;
