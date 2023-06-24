const { generateToken } = require('../utils/jwt')
const { userModel } = require('../managerDaos/mongo/models/user.model')
const { createHash, isValidPassword } = require('../utils/bcryptHash')

class SessionsController {
  login = async (request, response) => {
    try {
      console.log(request.body)
      const { email, password } = request.body

      if (!email || !password)
        throw new Error('Los campos E-mail y Password son obligatorios')

      const userFromDB = await userModel.findOne({
        email: email,
      })

      if (!userFromDB)
        throw new Error('No existe un usuario con el correo indicado')

      if (!isValidPassword(password, userFromDB))
        throw new Error('La contraseña ingresada es inválida')

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
      response.send({ status: 'error', message: error.message })
    }
  }

  register = async (request, response) => {
    try {
      const { firstName, lastName, email, age, password } = request.body
      let isAdmin = request.body.isAdmin

      console.log(request.body)

      if (!firstName || !lastName || !email || !password)
        response.send({
          status: 'error',
          message:
            'Los campos "Nombre", "Apellido", "E-Mail" y "Password" son obligatorios',
        })

      const eMailExists = await userModel.findOne({ email: email })

      if (eMailExists)
        response.send({
          status: 'error',
          message: 'El E-mail ingresado ya existe',
        })

      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        age: age ? age : null,
        password: createHash(password),
        role: isAdmin === 'on' ? (isAdmin = 'Admin') : (isAdmin = 'User'),
      }

      console.log('userData', userData)

      let newUser = await userModel.create(userData)

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
      response.send({ status: 'error', message: error.message })
    }
  }

  //TODO: Implementar gitHubLogin con JWT en este controlador
}

module.exports = new SessionsController()