class ProductDto {
  constructor(product) {
    this.title = product.title ? product.title : product.titulo
    this.description = product.description
      ? product.description
      : product.descripcion
    this.price = product.price ? product.price : product.precio
    this.thumbnails = product.thumbnails ? product.thumbnails : product.fotos
    this.code = product.code
      ? product.code.toLowerCase()
      : product.codigo.toLowerCase()
    this.category = product.category ? product.category : product.categoria
  }
}

module.exports = ProductDto
