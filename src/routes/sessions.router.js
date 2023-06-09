const { Router } = require('express')
//TODO: Implementar el userManagerMongo para desligar a este archivo del manejo de usuarios
const { userModel } = require('../managerDaos/mongo/models/user.model')
const { createHash, isValidPassword } = require('../utils/bcryptHash')
const passport = require('passport')
const { login, register } = require('../controllers/sessions.controller')
const { passportAuth } = require('../middlewares/passportAuthentication')
const {
  passportAuthorization,
} = require('../middlewares/passportAuthorization')

const router = Router()

router
  .post('/login', login)
  .post('/register', register)
  .get(
    '/current',
    passportAuth('jwt'),
    passportAuthorization('Admin'),
    async (request, response) => {
      response.send('LLEGASTE A CURRENT')
    }
  )

router.get('/logout', async (request, response) => {
  try {
    response.clearCookie('accessToken').redirect('/login')
  } catch (error) {
    response
      .status(500)
      .send({ status: 'error', message: 'Se produjo un error al desloguearse' })
  }
})

router.get('/loginFailed', async (request, response) => {
  console.log('Falló la estrategia de login')
  response
    .status(500)
    .send({ status: 'error', message: 'Se produjo un error al loguearse' })
})

router.get('/registrationFailed', async (request, response) => {
  console.log('Falló la estrategia de registro')
  response
    .status(500)
    .send({ status: 'error', message: 'Se produjo un error al registrarse' })
})

//TODO: Pasar el restore Password al controlador de sesiones
router.post('/restorePassword', async (request, response) => {
  try {
    const { eMail, newPassword } = request.body

    if (!eMail || !newPassword)
      return response.status(400).send({
        status: 'error',
        message: '"E-Mail" y "Password" son obligatorios',
      })

    const userFromDB = await userModel.findOneAndUpdate(
      {
        email: eMail,
      },
      { $set: { password: createHash(newPassword) } }
    )

    if (!userFromDB)
      //TODO: Redireccionar a una página de error o arrojar un modal con un error
      return response.status(401).send({
        status: 'error',
        message: 'El usuario ingresado no existe',
      })

    //TODO: Redireccionar a la página de login
    response.status(200).send({
      status: 'success',
      message: 'Constaseña actualizada exitosamente',
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

router.get(
  '/githublogin',
  passport.authenticate('githublogin', { scope: ['user:email'] }),
  async (request, response) => {
    response.send('Entré')
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
      .cookie('accessToken', request.user, {
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

/*
router.get('*', async (request, response) => {
  response.status(404).send('404 Not Found')
})*/

module.exports = router
