class Product {
  constructor(
    title,
    code,
    stock,
    description,
    price,
    status = true,
    category,
    thumbnails
  ) {
    if (!title) {
      throw new Error(this.#buildError('title'));
    }

    if (!code) {
      throw new Error(this.#buildError('code'));
    }

    if (!description) {
      throw new Error(this.#buildError('description'));
    }

    if (!price) {
      throw new Error(this.#buildError('price'));
    }

    if (!category) {
      throw new Error(this.#buildError('category'));
    }

    if (!thumbnails) {
      throw new Error(this.#buildError('thumbnails'));
    }

    this.title = title;
    this.description = description;
    this.price = price;
    this.thumbnails = thumbnails;
    this.code = code;
    this.stock = stock || 1;
    this.status = status;
    this.category = category;
  }

  setId(id) {
    this.id = id;
  }

  #buildError(err = 'Error desconocido') {
    return `El dato ${err} es obligatorio`;
  }
}

module.exports = Product;
