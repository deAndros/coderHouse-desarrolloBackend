const { faker } = require('@faker-js/faker')

exports.generateProducts = async (request, response) => {
  const quantity = request.params.quantity
  let products = []

  for (let i = 0; i < quantity; i++) {
    mockedProduct = {
      _id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      code:
        faker.string.alpha({ count: 3 }).toUpperCase() +
        faker.number.int({ min: 1, max: 100 }),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      price: faker.commerce.price(),
      stock: faker.string.numeric(),
      status: faker.datatype.boolean(0.6),
      thumbnails: [faker.image.url()],
    }
    products.push(mockedProduct)
  }

  response.sendSuccess(products)
}
