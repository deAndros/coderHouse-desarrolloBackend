const cartElement = document.getElementById('cidHolder')
const cartId = document.getElementById('cidHolder').getAttribute('cid')
console.log('cartElement', cartElement)
console.log('cartId', cartId)

// Función asincrónica para manejar el clic en "Agregar al carrito"
async function addToCart(button) {
  // Verifica si ya se está procesando una solicitud
  if (button.getAttribute('processing') === 'true') {
    return
  }

  // Obtiene el producto y realiza la lógica de agregar al carrito
  const productCard = button.closest('.product-card')
  const productId = productCard.getAttribute('pid')

  // Muestra una barra de carga
  button.setAttribute('processing', 'true')
  button.innerText = 'Procesando...'
  button.disabled = true

  try {
    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: 1 }),
    })

    if (response.status != 200) {
      const errorMessage = await response.text()

      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: JSON.parse(errorMessage).error,
        showConfirmButton: true,
      })

      // Restaura el botón
      button.removeAttribute('processing')
      button.innerText = 'Agregar al carrito'
      button.disabled = false

      return
    }

    // Muestra una notificación de éxito
    Swal.fire({
      icon: 'success',
      title: 'Producto agregado al carrito',
      showConfirmButton: false,
      timer: 2000, // Duración de la notificación en milisegundos
    })

    // Restaura el botón
    button.removeAttribute('processing')
    button.innerText = 'Agregar al carrito'
    button.disabled = false
  } catch (error) {
    console.error(error)

    // En caso de error, muestra una notificación de error
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al agregar el producto al carrito',
    })

    // Restaura el botón
    button.removeAttribute('processing')
    button.innerText = 'Agregar al carrito'
    button.disabled = false
  }
}

// Agrego un evento de click a todos los botones "Agregar al carrito"
const addToCartButtons = document.querySelectorAll('.add-to-cart-button')
addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addToCart(button)
  })
})
