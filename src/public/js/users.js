const applySortButton = document.getElementById('applySort')
const sortFieldSelect = document.getElementById('sortField')
const sortOrderSelect = document.getElementById('sortOrder')

applySortButton.addEventListener('click', () => {
  const selectedSortField = sortFieldSelect.value
  const selectedSortOrder = sortOrderSelect.value
  const queryParams = new URLSearchParams({
    sortField: selectedSortField,
    sortOrder: selectedSortOrder,
  })
  window.location.href = `?${queryParams.toString()}`
})

function changeRole(userId) {
  const apiUrl = `/api/users/premium/${userId}`

  fetch(apiUrl, {
    method: 'PUT',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status != 'SUCCESS')
        return Swal.fire('Error al modificar el rol', `${data.error}`, 'error')

      Swal.fire({
        title: `${data.payload.message}`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'OK',
      }).then((result) => {
        // Verifica si el botón "OK" fue presionado
        if (result.isConfirmed) {
          // Recarga la página
          location.reload()
        }
      })
    })
    .catch((error) => {
      Swal.fire(
        'Se produjo un error inesperado, por favor contacte con el administrador',
        'error'
      )
    })
}

function deleteUser(userId) {
  const apiUrl = `/api/users/${userId}`
  fetch(apiUrl, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status != 'SUCCESS')
        return Swal.fire(
          'Se produjo un error al eliminar el usuario, contacte con el administrador',
          `${data.error}`,
          'error'
        )

      Swal.fire({
        title: `${data.payload.message}`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'OK',
      }).then((result) => {
        // Verifica si el botón "OK" fue presionado
        if (result.isConfirmed) {
          // Recarga la página
          location.reload()
        }
      })
    })
    .catch((error) => {
      Swal.fire(
        'Se produjo un error inesperado, por favor contacte con el administrador',
        'error'
      )
    })
}
