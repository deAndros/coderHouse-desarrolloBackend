const passportAuthorization = (requiredRoles) => {
  return async (request, response, next) => {
    const userMetadata = request.user.user

    if (!userMetadata.role)
      return response.status(401).send({
        status: 'error',
        error: 'El usuario no está autorizado para acceder a este endpoint',
      })

    if (!requiredRoles.includes(userMetadata.role.toUpperCase()))
      return response.status(403).send({
        status: 'error',
        message:
          'El usuario no posee los permisos para acceder a este endpoint',
      })
    next()
  }
}

module.exports = { passportAuthorization }
