const { productsService } = require('../services')

class ProductsController {
  getProducts = async (request, response) => {
    try {
      let { limit = 5, page = 1, sort = 'asc' } = request.query

      //TODO: Trabajar para mejorar las sort Options y dar posibilidades de ordenamiento
      const sortOptions = {
        page: page,
        limit: limit,
        lean: true,
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
        : (prevLink = `/api/products?page=${nextPage}&limit=${limit}&sort=${sort}`)

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

      const productFound = await productsService.getByCode(request.body.code)

      if (productFound)
        return response.sendUserError(
          new Error(
            `El código ${product.code} ya se encuentra utilizado por otro producto.`
          )
        )

      const productToCreate = {
        title: request.body.title,
        code: request.body.code,
        stock: request.body.stock,
        description: request.body.description,
        price: request.body.price,
        status: request.body.status,
        category: request.body.category,
        thumbnails: request.body.thumbnails,
      }

      const newProduct = await productsService.create(productToCreate)
      response.sendSuccess({ newProduct: newProduct })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  updateProduct = async (request, response) => {
    try {
      const {
        newId,
        title,
        code,
        description,
        category,
        price,
        status,
        thumbnails,
        stock,
      } = request.body

      if (newId)
        return response.sendUserError(
          new Error(
            'El ID de un producto no puede ser actualizado. No se debe enviar el parámetro "id" en el body de esta petición'
          )
        )

      if (!title || !code || !description || !category || !price)
        return response.sendUserError(
          new Error(
            'Los parámetros title, code, description, category y price son obligatorios'
          )
        )

      //Si el código ingresado es distinto al que tenía ese producto y a su vez existe otro producto con ese código arrojo un error.
      const hasRepeatedCode = await productsService.getByCustomFilter({
        code: code,
        _id: { $ne: request.params.id },
      })

      if (hasRepeatedCode.length != 0)
        return response.sendUserError(
          new Error(
            `El código ${product.code} ya se encuentra utilizado por otro producto.`
          )
        )

      const productToBeReplaced = {
        title: title,
        code: code,
        description: description,
        category: category,
        price: price,
        stock: stock,
        status: status,
        thumbnails: thumbnails,
      }

      await productsService.update(request.params.id, productToBeReplaced)

      response.sendSuccess({
        message: 'El producto fue actualizado correctamente',
      })
    } catch (error) {
      response.sendServerError(error)
    }
  }

  deleteProduct = async (request, response) => {
    try {
      const id = request.params.id

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
