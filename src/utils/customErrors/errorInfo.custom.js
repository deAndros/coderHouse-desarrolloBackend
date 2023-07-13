exports.generateUserErrorInfo = (user, action) => {
  //Action está para contemplar los distintos eventos en los que se usa al usuario. En este caso puede valer: Login, Register, Update, Delete, etc.
  //TODO: Implementar action para discriminar y especificar más el mensaje de respuesta
  let info = `One or more properties were incomplete or not valid.
    * email: needs to be String, received ${user.email}`

  if (!user.password)
    info += '\n  *password: needs to be String but was not provided'

  return info
}

exports.generatePoductErrorInfo = (product) => {
  return `One or more properties were incomplete or not valid.
        listado de requirimientos de propiedades del user:
        * first_name: needs to a String, received ${user.title}
        * last_name: needs to a String, received ${user.price}
        * email: needs to a String, received ${user.category}`
}
