class Cart {
  constructor(id) {
    this.id = id;
    this.products = [];
  }

  addProduct = async (productId) => {
    const productArray = this.products;
    //Busco si el producto existe previamente en el carrito
    const productInCartIndex = productArray.findIndex((element) => {
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
      (element) => element.id === productId
    );

    let productQuantity = this.products[productInCartIndex].quantity;

    // Si existe y hay uno, lo elimino del arreglo
    if (productInCartIndex !== -1 && productQuantity === 1) {
      this.products.splice(objectIndex, 1);
      //Si existe y hay más de uno, reduzco su cantidad en 1
    } else if (productInCartIndex !== -1 && productQuantity > 1) {
      productQuantity--;
    } else {
      // Si no existe...
      throw new Error("No se puede eliminar un producto que no existe");
    }
  };

  getProducts = async () => {
    return this.products;
  };
}

module.exports = Cart;
