const { usersService, cartsService } = require('../services')
const fs = require('fs/promises')
const path = require('path')
const fs2 = require('fs')

class UsersController {
  getUsers = async (request, response) => {
    try {
      const page = parseInt(request.query.page) || 1
      const limit = parseInt(request.query.limit) || 10
      const sortField = request.query.sortField || 'email'
      const sortOrder = request.query.sortOrder || 'asc'

      const sortOptions = { [sortField]: sortOrder }
      const paginationOptions = { page, limit, sort: sortOptions }
      const result = await usersService.get(paginationOptions)

      if (request.headers.internalRequest) return result.docs

      response.sendSuccess({
        users: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
      })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  getUserById = async (request, response) => {
    try {
      const userFound = await usersService.getById(request.params.uid)

      if (!userFound && !request.headers.internalRequest) {
        return response.sendBadRequest(
          new Error(`No existe un usuario cuyo ID sea: ${request.params.uid}`)
        )
      } else if (!userFound && request.headers.internalRequest) {
        return false
      } else if (userFound && request.headers.internalRequest) {
        return true
      }

      const {
        _id,
        password: dbPassword,
        __v,
        ...userMetadata
      } = userFound.toObject()

      response.sendSuccess({ user: userMetadata })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  createUser = async (request, response) => {
    try {
      if (Object.keys(request.body).length === 0)
        return response.sendBadRequest(new Error('No se encontró post-data'))

      const { firstName, lastName, email, password } = request.body

      if (!firstName || !lastName || !email || !password)
        response.sendBadRequest(
          new Error(
            'Los campos "Nombre", "Apellido", "E-Mail" y "Password" son obligatorios'
          )
        )

      const userFound = await usersService.getByEmail(email)

      if (userFound)
        return response.sendBadRequest(
          new Error(
            `El email ${request.body.email} ya se encuentra utilizado por otro usuario.`
          )
        )

      const newUserCart = await cartsService.create()
      const newUser = await usersService.create(request.body, newUserCart)

      const {
        password: dbPassword,
        __v,
        ...newUserMetadata
      } = newUser.toObject()

      response.sendSuccess({ newUser: newUserMetadata })
    } catch (error) {
      if (request.headers.internalRequest)
        return {
          error: true,
          message: error.message,
        }
      response.sendInternalServerError(error)
    }
  }

  swapRole = async (request, response) => {
    try {
      const userFound = await usersService.getById(request.params.uid)

      if (!userFound)
        return response.sendBadRequest(
          new Error(`No existe un usuario cuyo ID sea: ${request.params.uid}`)
        )

      if (userFound.role === 'Premium') {
        userFound.role = 'User'
      } else if (userFound.role === 'User') {
        // Verificar si el usuario ha subido los documentos requeridos
        const documentsPath = path.join(
          __dirname,
          '..',
          'uploads',
          'documents',
          userFound.email
        )

        if (!fs2.existsSync(documentsPath)) {
          return response.sendBadRequest(
            new Error(`El usuario no ha subido ningún documento aún`)
          )
        }

        const files = await fs.readdir(documentsPath)
        const requiredDocuments = [
          'Identificación',
          'Comprobante de domicilio',
          'Comprobante de estado de cuenta',
        ]

        const missingDocuments = requiredDocuments.filter(
          (doc) =>
            !files.some((file) => {
              const decodedFileName = decodeURIComponent(file)
              //TODO: Modificar esto para que solo acepte PDFs, JPEG y PNG
              return decodedFileName.endsWith(`-${doc}.txt`)
            })
        )

        if (missingDocuments.length > 0) {
          return response.sendBadRequest(
            new Error(
              `El usuario no ha subido todos los documentos requeridos: ${missingDocuments.join(
                ', '
              )}`
            )
          )
        }

        userFound.role = 'Premium'
      } else {
        return response.sendBadRequest(
          new Error(
            'No puede modificarse el rol de un usuario que no tenga el rol User o Premium'
          )
        )
      }

      const {
        _id,
        password: dbPassword,
        __v,
        ...userMetadata
      } = userFound.toObject()

      const modifiedUser = await usersService.update(
        request.params.uid,
        userMetadata
      )

      response.sendSuccess({
        message: `El rol fue actualizado correctamente a ${modifiedUser.role}`,
      })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  updateUser = async (request, response) => {
    try {
      if (request.body.id || request.body._id)
        return response.sendBadRequest(
          new Error('El ID de un usuario no puede ser actualizado.')
        )

      //Si el email ingresado es distinto al que tenía ese usuario y a su vez existe otro usuario con ese código arrojo un error.
      const hasRepeatedEmail = await usersService.getByCustomFilter({
        email: email,
        _id: { $ne: request.params.id },
      })

      if (hasRepeatedEmail.length != 0)
        return response.sendBadRequest(
          new Error(
            `El email ${request.body.email} ya se encuentra utilizado por otro usuario.`
          )
        )

      await usersService.update(request.params.uid, request.body)

      response.sendSuccess({
        message: 'El usuario fue actualizado correctamente',
      })
    } catch (error) {
      response.sendInternalServerError(error)
    }
  }

  deleteUser = async (request, response) => {
    try {
      const deletedUser = await usersService.delete(request.params.uid)

      if (!deletedUser)
        return response.sendBadRequest(
          new Error(`No existe un usuario con ID igual a ${request.params.uid}`)
        )

      const deletedCart = await cartsService.delete(deletedUser.cart)

      if (!deletedCart || deletedCart == null) {
        request.debug(
          'El usuario se pudo eliminar correctamente, pero no tenía carrito'
        )
      }

      response.sendSuccess({
        message: 'El usuario se eliminó correctamente',
        deletedUser: deletedUser,
      })
    } catch (error) {
      response.sendInternalServerError(error.message)
    }
  }

  retorePassword = async (request, response) => {
    try {
    } catch (error) {}
  }

  uploadDocument = async (request, response) => {
    response.sendSuccess('Archivos subidos correctamente')
  }
}

module.exports = new UsersController()
