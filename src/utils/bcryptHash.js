const bcrypt = require('bcrypt')

//Esta función hashea el password
exports.createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10))

//Esta función compara las contraseñas
exports.isValidPassword = (password, user) => {
  return bcrypt.compareSync(password, user.password)
}

//Utilizar exports. antes de una variable/función la añade automáticamente al objeto exports. Es una forma alternativa de exportar
