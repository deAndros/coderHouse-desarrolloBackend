const { productsService } = require('../services')

class ProductsController {
  getProducts = async (request, response) => {
    try {
      let { limit = 5, page = 1, sort = 'asc' } = request.query

      //TODO: Trabajar para mejorar las sort Options y dar posibilidades de ordenamiento
      const sortOptions = {
        page: page,
        limit: limit,
        //sort: sort === 'asc' ? 1 : -1,
      }

      const result = await productsService.get(sortOptions)

      let { docs, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage } =
        result

      let prevLink
      let nextLink

      !hasPrevPage
        ? (prevLink = null)
        : (prevLink = `/api/products?page=${prevPage}&limit=${limit}&sort=${sort}`)

      !hasNextPage
        ? (nextLink = null)
        : (nextLink = `/api/products?page=${nextPage}&limit=${limit}&sort=${sort}`)

      if (request.headers.internalRequest) return docs

      response.sendSuccess({
        products: docs,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  getProductById = async (request, response) => {
    try {
      const productFound = await productsService.getById(request.params.pid)

      if (!productFound && !request.headers.internalRequest) {
        return response.sendUserError(
          new Error(`No existe un producto cuyo ID sea: ${request.params.pid}`)
        )
      } else if (!productFound && request.headers.internalRequest) {
        return false
      } else if (productFound && request.headers.internalRequest) {
        return true
      }

      response.sendSuccess({ product: productFound })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  addProduct = async (request, response) => {
    try {
      if (Object.keys(request.body).length === 0)
        return response.sendUserError(new Error('No se encontró post-data'))

      const productFound = await productsService.getByCode(request.body)

      if (productFound)
        return response.sendUserError(
          new Error(
            `El código ${productFound.code} ya se encuentra utilizado por otro producto.`
          )
        )

      request.body.owner = request.user.email

      const newProduct = await productsService.create(request.body)

      response.sendSuccess({ newProduct: newProduct })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  updateProduct = async (request, response) => {
    try {
      if (Object.keys(request.body).length === 0)
        return response.sendUserError(new Error('No se encontró post-data'))

      const { id } = request.params
      const { code } = request.body

      //Si el código ingresado es distinto al que tenía ese producto y a su vez existe otro producto con ese código arrojo un error.
      const hasRepeatedCode = await productsService.getByCustomFilter({
        code: code.toLowerCase(),
        _id: { $ne: id },
      })

      if (hasRepeatedCode.length != 0)
        return response.sendUserError(
          new Error(
            `El código ${code} ya se encuentra utilizado por otro producto.`
          )
        )

      await productsService.update(id, request.body)

      response.sendSuccess({
        message: 'El producto fue actualizado correctamente',
      })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  deleteProduct = async (request, response) => {
    try {
      const { id } = request.params
      const { user } = request

      //TODO: Buscar la manera de no llamar dos veces a la base de datos para validar el owner
      const productToDelete = await productsService.getById(id)

      if (user.email != productToDelete.owner)
        return response.sendUserError(
          new Error(
            `El producto que desea eliminar no le pertenece a ${user.email}`
          )
        )

      const deletedProduct = await productsService.delete(id)

      if (!deletedProduct)
        return response.sendUserError(
          new Error(`No existe un producto con ID igual a ${id}`)
        )

      response.sendSuccess({
        message: 'El producto se eliminó correctamente',
        deletedProduct: deletedProduct,
      })
    } catch (error) {
      response.sendServerError(error.message)
    }
  }
}

module.exports = new ProductsController()
