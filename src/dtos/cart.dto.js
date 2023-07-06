class CartDto {
  constructor(products) {
    this.products = products
    this.products.quantity = products.quantity
  }
}

module.exports = CartDto
