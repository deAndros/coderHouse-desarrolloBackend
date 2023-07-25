const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (user, expiration) => {
  return (token = jwt.sign({ user }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: expiration,
  }))
}

const validateToken = (request, response, next) => {
  const authHeader = request.headers['authorization']

  if (!authHeader) {
    return response
      .status(401)
      .send({ status: error, message: 'No se encuentra autenticado' })
  }

  const token = authHeader.split('')[1]

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (error, credentials) => {
    if (error)
      return response
        .status(401)
        .send({ status: error, message: 'No se encuentra autenticado' })

    request.logger.debug('credentials', credentials)
    request.user = credentials.user
    next()
  })
}

module.exports = { generateToken, validateToken }
