const passport = require('passport')

//Función que sirve para determinar si el JWT que presenta el cliente fue o no emitido por nuestra aplicación
const passportAuth = (strategy) => {
  return async (request, response, next) => {
    passport.authenticate(strategy, function (error, user, info) {
      if (error) {
        return next(error)
      }

      if (!user) {
        return response.status(401).send({
          status: 'error',
          error: info.message ? info.message : info.toString(),
        })
      }
      request.user = user
      next()
    })(request, response, next)
  }
}

module.exports = { passportAuth }
