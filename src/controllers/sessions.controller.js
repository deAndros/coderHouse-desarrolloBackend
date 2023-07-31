const { generateToken } = require('../utils/jwt')
const { isValidPassword } = require('../utils/bcryptHash')
const { usersService, cartsService } = require('../services')
const { CustomError } = require('../utils/customErrors/Error.custom.class')
const {
  generateUserErrorInfo,
} = require('../utils/customErrors/errorInfo.custom')
const { errorCodes } = require('../utils/customErrors/errorCodes.custom')
const { sendEmail } = require('../utils/emailSender')
const { logger } = require('../config/logger.config')

class SessionsController {
  login = async (request, response, next) => {
    try {
      const { email, password } = request.body

      if (!email || !password)
        CustomError.createError({
          name: 'Login failed',
          cause: generateUserErrorInfo({ email, password }, 'login'),
          message: 'El email y el password son obligatorios',
          code: errorCodes.INVALID_TYPE_ERROR,
        })

      const userFromDB = await usersService.getByEmail(email)

      if (!userFromDB)
        CustomError.createError({
          name: 'Login failed',
          cause: generateUserErrorInfo({ email, password }),
          message: 'No existe un usuario con el correo indicado',
          code: errorCodes.INVALID_CREDENTIALS_ERROR,
        })

      if (!isValidPassword(password, userFromDB))
        CustomError.createError({
          name: 'Login failed',
          cause: generateUserErrorInfo({ email, password }, 'login'),
          message: 'La contraseña ingresada es inválida',
          code: errorCodes.INVALID_CREDENTIALS_ERROR,
        })

      const {
        _id,
        password: dbPassword,
        __v,
        ...userMetadata
      } = userFromDB.toObject()

      const accessToken = generateToken(userMetadata, '50m')

      response
        .cookie('Authorization', accessToken, {
          maxAge: 60 * 60 * 10000,
          httpOnly: true,
        })
        .redirect('/products')
    } catch (error) {
      next(error)
    }
  }

  logout = async (request, response) => {
    try {
      response.clearCookie('Authorization').redirect('/login')
    } catch (error) {
      response.status(500).send({
        status: 'error',
        message: 'Se produjo un error al desloguearse',
      })
    }
  }

  register = async (request, response, next) => {
    try {
      //TODO: Agregar envío de mail cuando se registra un usuario
      const { firstName, lastName, email, age, password, isAdmin } =
        request.body

      if (!firstName || !lastName || !email || !password)
        CustomError.createError({
          name: 'Registration failed',
          cause: generateUserErrorInfo(
            {
              firstName,
              lastName,
              email,
              password,
            },
            'register'
          ),
          message:
            'El email, el nombre, el apellido y el password son obligatorios',
          code: errorCodes.INVALID_TYPE_ERROR,
        })

      const emailExists = await usersService.getByEmail(email)

      if (emailExists)
        CustomError.createError({
          name: 'Registration failed',
          cause: generateUserErrorInfo(
            {
              firstName,
              lastName,
              email,
              password,
            },
            'register'
          ),
          message: 'Ya existe una cuenta con el email ingresado',
          code: errorCodes.INVALID_CREDENTIALS_ERROR,
        })

      const newUserCart = await cartsService.create()
      let newUser = await usersService.create(request.body, newUserCart)

      const {
        _id,
        password: dbPassword,
        __v,
        ...newUserMetadata
      } = newUser.toObject()

      response.send({
        status: 'success',
        newUser: newUserMetadata,
      })
    } catch (error) {
      next(error)
    }
  }

  sendRestorationEmail = async (request, response, next) => {
    try {
      const { email } = request.body

      if (!email)
        CustomError.createError({
          name: 'Password restoration failed',
          cause: generateUserErrorInfo(
            {
              email,
            },
            'restorePassword'
          ),
          message: 'El email es obligatorio',
          code: errorCodes.INVALID_TYPE_ERROR,
        })

      const userFromDB = await usersService.getByEmail(email)

      if (!userFromDB)
        //TODO: Redireccionar a una página de error o arrojar un modal con un error
        CustomError.createError({
          name: 'Password restoration failed',
          cause: generateUserErrorInfo(
            {
              email,
            },
            'restorePassword'
          ),
          message: 'No existe un usuario con el email ingresado',
          code: errorCodes.INVALID_CREDENTIALS_ERROR,
        })

      const {
        _id,
        password: dbPassword,
        __v,
        ...userMetadata
      } = userFromDB.toObject()

      const accessToken = generateToken(userMetadata, '1m')

      const html = `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Password Reset Request</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f2f2f2;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #000000;
                  border: 2px solid #00CED1;
                  border-radius: 5px;
                  color: #FFFFFF;
              }
              h2 {
                  text-align: center;
              }
              p {
                  text-align: center;
              }
              .button {
                  text-align: center;
                  margin-top: 20px;
              }
              .button a {
                  display: inline-block;
                  background-color: #00CED1;
                  color: #FFFFFF;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Hello, ${userMetadata.email}</h2>
              <p>Someone, hopefully you, has requested to reset the password for your account on our site.</p>
              <p>If you did not perform this request, you can safely ignore this email.</p>
              <p>Otherwise, click the link below to complete the process.</p>
              <div class="button">
                  <a href="http://localhost:8080/enterNewPassword">Reset Password</a>
              </div>
          </div>
      </body>
      </html>
      `

      await sendEmail(email, 'Restablecer contraseña', html)

      response
        .cookie('Authorization', accessToken, {
          maxAge: 3.6e6,
          //httpOnly: true,
        })
        .redirect(`/emailSent`)
    } catch (error) {
      next(error)
    }
  }

  enterNewPassword = async (request, response, next) => {
    try {
      const { email } = request.user.user
      const newPassword = request.body.password

      if (!email)
        CustomError.createError({
          name: 'Password restoration failed',
          cause: generateUserErrorInfo(
            {
              email,
            },
            'enterNewPassword'
          ),
          message: 'El email es obligatorio',
          code: errorCodes.INVALID_TYPE_ERROR,
        })

      const userFromDB = await usersService.getByEmail(email)

      if (!userFromDB)
        //TODO: Redireccionar a una página de error o arrojar un modal con un error
        CustomError.createError({
          name: 'Password restoration failed',
          cause: generateUserErrorInfo(
            {
              email,
            },
            'enterNewPassword'
          ),
          message: 'No existe un usuario con el email ingresado',
          code: errorCodes.INVALID_CREDENTIALS_ERROR,
        })

      if (isValidPassword(newPassword, userFromDB)) {
        logger.warning(
          'Contraseña repetida, redireccionando a /enterNewPassword?warning=true'
        )
        return response.redirect('/enterNewPassword?warning=true')
      }

      userFromDB.password = newPassword
      await usersService.update(userFromDB._id, userFromDB)

      response.redirect('/passwordRestored')
    } catch (error) {
      next(error)
    }
  }

  //TODO: Implementar gitHubLogin con JWT en este controlador
}

module.exports = new SessionsController()
