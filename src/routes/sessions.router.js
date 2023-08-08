const { Router } = require('express')
const passport = require('passport')
const {
  login,
  logout,
  register,
  enterNewPassword,
  sendRestorationEmail,
} = require('../controllers/sessions.controller')
const { passportAuth } = require('../middlewares/passportAuthentication')
const {
  passportAuthorization,
} = require('../middlewares/passportAuthorization')
const { logger } = require('../config/logger.config')

const router = Router()

router
  .post('/login', login)
  .get('/logout', logout)
  .post('/register', register)
  .post('/restorePassword', sendRestorationEmail)
  .post('/enterNewPassword', passportAuth('jwt'), enterNewPassword)
  .get(
    '/current',
    passportAuth('jwt'),
    passportAuthorization(['ADMIN']),
    async (request, response) => {
      response.send('LLEGASTE A CURRENT')
    }
  )

router.get('/loginFailed', async (request, response) => {
  logger.error('Falló la estrategia de login')
  response
    .status(500)
    .send({ status: 'error', message: 'Se produjo un error al loguearse' })
})

router.get('/registrationFailed', async (request, response) => {
  logger.error('Falló la estrategia de registro')
  response
    .status(500)
    .send({ status: 'error', message: 'Se produjo un error al registrarse' })
})

router.get(
  '/githublogin',
  passport.authenticate('githublogin', { scope: ['user:email'] }),
  async (request, response) => {
    response.status(200).send('Entré')
  }
)

router.get(
  '/githubcallback',
  passport.authenticate('githublogin', {
    session: false,
    failureRedirect: '/login',
  }),
  async (request, response) => {
    response
      .cookie('Authorization', request.user, {
        maxAge: 60 * 60 * 10000,
        httpOnly: true,
      })
      .redirect('/products')
  }
)

router.get('/counter', (request, response) => {
  if (request.session.counter) {
    request.session.counter++
    response.send(`se ha visitado el sitio ${req.session.counter} veces.`)
  } else {
    request.session.counter = 1
    response.send('Bienvenido')
  }
})

//TODO: Incorporar el uso de esta función a mis estratégias de passport y moverla a un archivo en utils
isValidString = (string, pattern) => {
  //Patrones REGEX, se instancian con sugar syntax solo poniéndolos entre /patron/
  const firstLastNamePattern = '/^[a-zA-Z0-9sáéíóúÁÉÍÓÚ]+$/'
  const eMailPattern = '/^[^s@]+@[^s@]+.[^s@]+$/'
  const userNamePattern = '/^[a-zA-Z0-9]+$/'

  if (pattern === 'firstName' || pattern === 'lastName') {
    pattern = firstLastNamePattern
  } else if (pattern === 'eMail') {
    pattern = eMailPattern
  } else if (pattern === 'userName') {
    pattern === userNamePattern
  } else {
    throw new Error('El patrón ingresado es incorrecto')
  }

  //Verifico si la cadena coincide con el patrón
  pattern.test(string) ? true : false
}

router
  .get('*', async (request, response) => {
    response.status(404).send('404 Not Found')
  })
  .post('*', async (request, response) => {
    response.status(404).send('404 Not Found')
  })

module.exports = router
