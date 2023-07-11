const { generateProducts } = require('../mocks/generateProducts.mock')
const CustomRouter = require('./customRouter.class')

class MocksRouter extends CustomRouter {
  init() {
    this.get(
      '/products/:quantity(100|[1-9][0-9]?)',
      ['ADMIN'],
      generateProducts
    )
  }
}

module.exports = new MocksRouter()
