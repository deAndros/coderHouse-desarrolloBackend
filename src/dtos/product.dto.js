class ProductDto {
  constructor(product) {
    this.title = product.title ? product.title : product.titulo
    this.description = product.description
      ? product.description
      : product.descripcion
    this.price = product.price ? product.price : product.precio
    this.thumbnails = product.thumbnails ? product.thumbnails : product.fotos

    if (product.code) {
      this.code = product.code.toLowerCase()
    } else if (product.codigo) {
      this.code = product.codigo.toLowerCase()
    }

    this.category = product.category ? product.category : product.categoria
    this.owner = product.owner
    this.stock = product.stock
  }
}

module.exports = ProductDto
