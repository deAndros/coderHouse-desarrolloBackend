const CustomRouter = require('./customRouter.class')

class loggerTestRouter extends CustomRouter {
  init() {
    this.get('/', ['ADMIN'], async (request, response) => {
      request.logger.debug('Este es un log de DEBUG')
      request.logger.http('Este es un log de HTTP')
      request.logger.info('Este es un log de INFO')
      request.logger.warning('Este es un log de WARNING')
      request.logger.error('Este es un log de ERROR')
      request.logger.fatal('Este es un log de FATAL ERROR')

      response.sendSuccess({
        message: 'Mensajes de logger enviados. Revisá la consola!',
      })
    })
  }
}

module.exports = new loggerTestRouter()
