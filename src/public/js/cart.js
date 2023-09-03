// Función para incrementar la cantidad
function incrementQuantity(input) {
  let currentValue = parseInt(input.value)
  if (!isNaN(currentValue) && currentValue < 99) {
    input.value = currentValue + 1
  }
}

// Función para disminuir la cantidad
function decrementQuantity(input) {
  let currentValue = parseInt(input.value)
  if (!isNaN(currentValue) && currentValue > 1) {
    input.value = currentValue - 1
  }
}

// Agrego un event listener para el botón "x" dentro de cada tarjeta del carrito
document.querySelectorAll('.btn-remove').forEach((button) => {
  button.addEventListener('click', (event) => {
    // Obtengo el ID del producto desde el atributo "pid" propio del botón x
    const productId = event.currentTarget.getAttribute('pid')

    /* Obtengo el ID del carrito que settié en el contenedor cart-container
           Lo hice de esta manera porque dentro del {{each}} de handlebars solamente
           puedo acceder a las propiedades del objeto que estoy iterando, por ende settié
           el cid en un contenedor por fuera del {{each}} y lo voy a buscar con el closest*/
    const cartId = event.currentTarget
      .closest('.cart-container')
      .getAttribute('cid')

    // Realiza la eliminación visual del producto
    const cartItem = event.currentTarget.closest('.cart-item')
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if (cartItem) {
          cartItem.remove()
        }

        // Realiza una llamada a la API para eliminar el producto del carrito
        fetch(`/api/carts/${cartId}/product/${productId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Error al eliminar el producto del carrito')
            }
            console.log(response)
          })
          .catch((error) => {
            console.error(error)
            // Aquí puedes manejar errores de la llamada a la API
          })
      }
    })
  })
})
