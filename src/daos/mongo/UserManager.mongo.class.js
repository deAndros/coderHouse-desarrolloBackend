const { userModel } = require('./models/user.model')

class UserManagerMongo {
  getUsers = async (limit = 5, page = 1, sort = 'asc') => {
    try {
      const sortOptions = {
        price: sort === 'asc' ? 1 : -1,
      }

      const users = await userModel.paginate(
        {},
        { page: page, limit: limit, lean: true }
      )

      return users.docs
    } catch (error) {
      throw new Error(error.message)
    }
  }

  getUserById = async (id) => {
    try {
      const userFound = await userModel.findOne({ _id: id })

      if (!userFound)
        throw new Error('No existe un usuario con el ID seleccionado')

      return userFound
    } catch (error) {
      throw new Error(error.message)
    }
  }

  createUser = async (user) => {
    try {
      if (
        !user.user_name ||
        !user.first_name ||
        !user.last_name ||
        !user.email ||
        !user.password
      )
        throw new Error(
          'Los campos "Username", "Nombre", "Apellido", "E-Mail" y "Password" son obligatorios'
        )

      const userNameExists = await userModel.findOne({
        user_name: user.user_name.toUpperCase(),
      })

      const eMailExists = await userModel.findOne({ email: user.email })

      if (userNameExists)
        throw new Error('El ID de usuario ingresado ya existe')

      if (eMailExists)
        throw new Error('Ya existe un usuario con el e-mail ingresado')

      return await userModel.create(user)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = UserManagerMongo
