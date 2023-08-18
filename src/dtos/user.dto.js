const { createHash } = require('../utils/bcryptHash')

class UserDto {
  constructor(user, cart) {
    console.log('DTO', user)
    this.first_name = user.firstName ? user.firstName : user.first_name
    this.last_name = user.lastName ? user.lastName : user.last_name
    this.email = user.email
    this.age = user.age ? user.age : null
    this.password = user.password ? createHash(user.password) : undefined
    this.cart = cart
    this.last_connection = user.last_connection
    this.documents = user.documents

    //TODO: Mejorar esta lógica
    if (user.role) {
      this.role = user.role
    } else if (
      user.isAdmin === 'on' ||
      user.isAdmin === 'Admin' ||
      user.role === 'Admin'
    ) {
      this.role = 'Admin'
    } else {
      this.role = 'User'
    }
  }

  eliminarDatosSensibles = () => {
    const { _id, password: dbPassword, __v, ...userData } = this

    return userData
  }
}

module.exports = UserDto
