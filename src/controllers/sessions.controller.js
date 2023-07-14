const { generateToken } = require('../utils/jwt')
const { createHash, isValidPassword } = require('../utils/bcryptHash')
const { usersService, cartsService } = require('../services')
const { CustomError } = require('../utils/customErrors/Error.custom.class')
const {
  generateUserErrorInfo,
} = require('../utils/customErrors/errorInfo.custom')
const { errorCodes } = require('../utils/customErrors/errorCodes.custom')

class SessionsController {
  login = async (request, response, next) => {
    try {
      console.log('ENTRÉ')
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

      const accessToken = generateToken(userMetadata)

      response
        .cookie('accessToken', accessToken, {
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
      response.clearCookie('accessToken').redirect('/login')
    } catch (error) {
      response.status(500).send({
        status: 'error',
        message: 'Se produjo un error al desloguearse',
      })
    }
  }

  register = async (request, response, next) => {
    try {
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

  restorePassword = async (request, response, next) => {
    try {
      const { email, password } = request.body

      if (!email || !password)
        CustomError.createError({
          name: 'Password restoration failed',
          cause: generateUserErrorInfo(
            {
              email,
              password,
            },
            'restorePassword'
          ),
          message: 'El email y el password son obligatorios',
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
              password,
            },
            'restorePassword'
          ),
          message: 'No existe un usuario con el email ingresado',
          code: errorCodes.INVALID_CREDENTIALS_ERROR,
        })

      userFromDB.password = password

      await usersService.update(userFromDB._id, userFromDB)

      //TODO: Redireccionar a la página de login
      response.status(200).send({
        status: 'success',
        message: 'Constaseña actualizada correctamente',
      })
      /*TODO: Hacer un redirect a la página de login y arrojar una alerta indicando que la contraseña se actualizó correctamente*/
      //.redirect('/login')
    } catch (error) {
      next(error)
    }
  }

  //TODO: Implementar gitHubLogin con JWT en este controlador
}

module.exports = new SessionsController()
