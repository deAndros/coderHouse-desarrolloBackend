const { errorCodes } = require('../utils/customErrors/errorCodes.custom')

exports.errorHandler = (error, request, response, next) => {
  request.logger.error({
    message: error,
    details: error.message,
    cause: error.cause,
  })

  switch (error.code) {
    case errorCodes.INVALID_TYPE_ERROR:
      return response.status(400).send({
        status: 'error',
        error: error.name,
        message: error.message,
      })

    case errorCodes.INVALID_CREDENTIALS_ERROR:
      return response.status(400).send({
        status: 'error',
        error: error.name,
        message: error.message,
      })

    case errorCodes.ROUTING_ERROR:
      return response.send({
        status: 'error',
        error: error.name,
        message: error.message,
      })

    default:
      return response.send({
        status: 'error',
        error: 'Unhandled error',
      })
  }
}
