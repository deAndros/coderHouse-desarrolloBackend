const UserDto = require('../dtos/user.dto')

class UsersRepository {
  constructor(dao) {
    this.dao = dao
  }

  get = async (paginationOptions) => {
    return await this.dao.get(paginationOptions)
  }

  getById = async (id) => {
    return await this.dao.getById(id)
  }

  getByCustomFilter = async (customFilter) => {
    //TODO: Implementar este método en todos los DAOS (memory, fs, etc...)
    return await this.dao.getByCustomFilter(customFilter)
  }

  getByEmail = async (email) => {
    return await this.dao.getByEmail(email)
  }

  //Método generado en caso de necesitar validar en el controlador lo que recibo por parámetro una vez que esté normalizado
  getDto = (user) => {
    return new UserDto(user)
  }

  create = async (user, cart) => {
    let userToCreate = new UserDto(user, cart)
    return await this.dao.create(userToCreate)
  }

  update = async (id, user) => {
    let userToUpdate = new UserDto(user)
    return await this.dao.update(id, userToUpdate)
  }

  delete = async (id) => {
    //TODO: Agregar una validación para que se eliminen todos los productos cuyo ID coincidan con el que se recibió por parámetro de los carritos
    return await this.dao.delete(id)
  }
}

module.exports = UsersRepository
