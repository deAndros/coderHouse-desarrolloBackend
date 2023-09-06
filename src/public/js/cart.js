/*const successToast = Swal.mixin({
  toast: true,
  
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

const fireSuccessToast = (message) =>
  successToast.fire({
    icon: 'success',
    title: message,
  })

const errorToast = Swal.mixin({
  toast: true,
  
})

const fireErrorToast = (message) =>
  errorToast.fire({
    icon: 'error',
    title: message,
  })*/
let total = 0

//TODO: Llevar toasts y métodos purchaseCart y updateCart a otros archivos e importarlos
const purchaseCart = () =>
  fetch(`/api/carts/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

const updateCart = (cid, products) =>
  fetch(`/api/carts/${cid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(products),
  })

const deleteProductFromCart = (cid, pid) =>
  fetch(`/api/carts/${cid}/product/${pid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

// Función para incrementar la cantidad
function incrementQuantity(input) {
  let currentValue = parseInt(input.value)
  if (!isNaN(currentValue) && currentValue < 99) {
    input.value = currentValue + 1
    updateTotalPrice()
  }
}

// Función para disminuir la cantidad
function decrementQuantity(input) {
  let currentValue = parseInt(input.value)
  if (!isNaN(currentValue) && currentValue > 1) {
    input.value = currentValue - 1
    updateTotalPrice()
  }
}

// Función para actualizar el monto total del carrito
function updateTotalPrice() {
  total = 0

  // Itera sobre todos los elementos que contienen los precios y cantidades
  document.querySelectorAll('.cart-item').forEach((cartItem) => {
    const priceElement = cartItem.querySelector('.cart-product-price')
    const quantityInput = cartItem.querySelector('.cart-quantity-input')

    // Obtiene el precio y la cantidad como números

    const price = parseFloat(priceElement.textContent.replace('Precio: $', ''))
    const quantity = parseInt(quantityInput.value)

    // Calcula el subtotal del producto y lo agrega al total
    const subtotal = price * quantity
    total += subtotal
  })

  // Actualiza el elemento que muestra el monto total
  const totalPriceElement = document.getElementById('totalPrice')
  totalPriceElement.textContent = `Total: $${total.toFixed(2)}`
}

updateTotalPrice()

// Agrego un event listener para el botón "x" dentro de cada tarjeta del carrito
document.querySelectorAll('.btn-remove').forEach((button) => {
  button.addEventListener('click', async (event) => {
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (cartItem) {
          cartItem.remove()
        }

        try {
          const deleteProductFromCartRes = await deleteProductFromCart(
            cartId,
            productId
          )

          if (!deleteProductFromCartRes.ok) {
            throw new Error(response.statusText)
          }
        } catch {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Error al eliminar el producto ${error}}`,
            showConfirmButton: false,
            timer: 1500,
          })
        }
      }
    })
  })
})

document
  .getElementById('purchaseCartButton')
  .addEventListener('click', async (event) => {
    const cartContainer = document.getElementById('cidHolder')
    const cid = cartContainer.getAttribute('cid')

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deberá abonar un total de $${total}`,
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: '¡Comprar!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const cartQuantityInputs = Array.from(
          document.querySelectorAll('.cart-quantity-input')
        )
        try {
          const updateCartRes = await updateCart(cid, {
            products: cartQuantityInputs.map((c) => ({
              product: c.getAttribute('pid'),
              quantity: parseInt(c.value),
            })),
          })

          console.log('updateCartRes', updateCartRes)

          if (!updateCartRes.ok) {
            throw new Error(response.statusText)
          }

          const purchaseCartRes = await purchaseCart()
          if (!purchaseCartRes.ok) {
            throw new Error(response.statusText)
          }
          Swal.fire({
            icon: 'success',
            title: '¡Su compra fue exitosa!',
            showConfirmButton: false,
            timer: 1500,
          })
          //fireSuccessToast('Compra exitosa!')
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Error al realizar la compra ${error}}`,
            showConfirmButton: false,
            //timer: 1500,
          })
          //fireErrorToast(`Error al realizar la compra ${error}}`)
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })
  })
