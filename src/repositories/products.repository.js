const ProductDto = require('../dtos/product.dto')

class ProductsRepository {
  constructor(dao) {
    this.dao = dao
  }

  get = async () => {
    return await this.dao.get()
  }

  getById = async (id) => {
    return await this.dao.getById(id)
  }

  getByCustomFilter = async (customFilter) => {
    //TODO: Implementar este método en todos los DAOS (memory, fs, etc...)
    return await this.dao.getByCustomFilter(customFilter)
  }

  getByCode = async (product) => {
    let productToFind = new ProductDto(product)
    return await this.dao.getByCode(productToFind.code)
  }

  //Método generado en caso de necesitar validar en el controlador lo que recibo por parámetro una vez que esté normalizado
  getDto = (product) => {
    return new ProductDto(product)
  }

  create = async (product) => {
    let productToCreate = new ProductDto(product)
    return await this.dao.create(productToCreate)
  }

  update = async (id, product) => {
    let productToUpdate = new ProductDto(product)
    return await this.dao.update(id, productToUpdate)
  }

  updateStock = async (id, stock) => {
    return await this.dao.update({ _id: id }, { $set: { stock: stock } })
  }

  delete = async (id) => {
    //TODO: Agregar una validación para que se eliminen todos los productos cuyo ID coincidan con el que se recibió por parámetro de los carritos
    return await this.dao.delete(id)
  }

  deleteByCustomFilter = async (customFilter) => {
    //TODO: Agregar una validación para que se eliminen todos los productos cuyo ID coincidan con el que se recibió por parámetro de los carritos
    return await this.dao.deleteByCustomFilter(customFilter)
  }
}

module.exports = ProductsRepository
