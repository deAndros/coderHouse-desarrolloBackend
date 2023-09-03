exports.calculateTotalPrice = async (cart) => {
  let totalPrice = 0
  for (const cartItem of cart.products) {
    if (cartItem.product.stock > cartItem.quantity) {
      let updatedProductQuantity = cartItem.product.stock - cartItem.quantity

      if (updatedProductQuantity === 0) {
        await productsService.delete(cartItem.product._id)
      } else {
        await productsService.updateStock(
          cartItem.product._id,
          updatedProductQuantity
        )
      }

      totalPrice += cartItem.product.price * cartItem.quantity
    }
    return totalPrice
  }
}
