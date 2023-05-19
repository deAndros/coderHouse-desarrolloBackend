console.log('Este es mi index');

document.getElementById('btnLogout').addEventListener('click', function () {
  // Lógica para enviar la petición de logout al endpoint
  fetch('/logout', {
    method: 'GET',
  })
    .then((response) => {
      if (response.ok) {
        // Si la petición fue exitosa, redirige al usuario o realiza cualquier otra acción necesaria
        console.log('Logout exitoso');
        // Redirigir a otra página
        // window.location.href = "/nueva-pagina.html";
      } else {
        // Manejo de errores
        console.log('Error en el logout');
      }
    })
    .catch((error) => {
      // Manejo de errores de red u otros errores
      console.log('Error en la petición de logout:', error);
    });
});
