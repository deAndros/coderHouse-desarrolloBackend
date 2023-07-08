const CartDto = require('../dtos/cart.dto')

class CartsRepository {
  constructor(dao) {
    this.dao = dao
  }

  get = async () => {
    return await this.dao.get()
  }

  getById = async (id) => {
    return await this.dao.getById(id)
  }

  //Método generado en caso de necesitar validar en el controlador lo que recibo por parámetro una vez que esté normalizado
  getDto = (cart) => {
    return new CartDto(cart)
  }

  create = async (products) => {
    /*if (cart) {
      let cartToCreate = new CartDto(cart)
    }*/
    let cartToCreate = new CartDto(products)
    return await this.dao.create(cartToCreate.products)
  }

  update = async (filter, operation, upsert = true) => {
    /*TODO: Buscar una manera de hacer más genérico este método.
    Solo va a funcionar con Mongo, la lógica específica de Mongo debería manejarse únicamente en el DAO, no en el repository.*/
    return await this.dao.update(filter, operation, upsert)
  }

  delete = async (id) => {
    return await this.dao.delete(id)
  }
}

module.exports = CartsRepository
