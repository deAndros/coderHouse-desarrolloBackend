const { errorCodes } = require('../utils/customErrors/errorCodes.custom')

exports.errorHandler = (error, request, response, next) => {
  console.log('ENTREEEE')
  switch (error.code) {
    case errorCodes.INVALID_TYPE_ERROR:
      return response.send({ status: 'error', error: error.name })
      break

    default:
      return response.send({
        status: 'error',
        error: 'Unhandled error',
      })
  }
}
