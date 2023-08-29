const { Router } = require('express')
const passport = require('passport')
const {
  login,
  logout,
  register,
  enterNewPassword,
  sendRestorationEmail,
} = require('../controllers/sessions.controller')

const CustomRouter = require('./customRouter.class')

const router = Router()
class SessionsRouter extends CustomRouter {
  init() {
    this.post('/login', ['PUBLIC'], login)
    this.get('/logout', ['PUBLIC'], logout)
    this.post('/register', ['PUBLIC'], register)
    this.post('/restorePassword', ['PUBLIC'], sendRestorationEmail)
    this.post(
      '/enterNewPassword',
      ['USER', 'ADMIN', 'PREMIUM'],
      enterNewPassword
    )
    this.get(
      '/githublogin',
      ['PUBLIC'],
      passport.authenticate('githublogin', { scope: ['user:email'] }),
      async (request, response) => {
        response.status(200).send('Entré')
      }
    )

    this.get(
      '/githubcallback',
      ['PUBLIC'],
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
  }
}

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

module.exports = new SessionsRouter()
