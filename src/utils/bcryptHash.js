const bcrypt = require('bcrypt');

exports.createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

exports.isValidPassword = (password, user) =>
  bcrypt.compareSync(password, user.password);

//Utilizar exports. antes de una variable/función la añade automáticamente al objeto exports. Es una forma alternativa de exportar
