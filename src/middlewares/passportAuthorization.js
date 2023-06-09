const passportAuthorization = (requiredRole) => {
  return async (request, response, next) => {
    const userMetadata = request.user.user
    console.log(userMetadata.role)
    if (!userMetadata.role)
      return response.status(401).send({
        status: 'error',
        error: 'El usuario no está autorizado para acceder a este endpoint',
      })

    if (userMetadata.role !== requiredRole)
      return response.status(403).send({
        status: 'error',
        message:
          'El usuario no posee los permisos para acceder a este endpoint',
      })
    next()
  }
}

module.exports = { passportAuthorization }
