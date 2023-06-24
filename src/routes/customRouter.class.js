const { Router } = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

class CustomRouter {
  constructor() {
    this.router = Router()
    this.init()
  }

  getRouter() {
    return this.router
  }

  init() {}

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...parameters) => {
      try {
        await callback.apply(this, parameters)
      } catch (error) {
        console.log(error.message)
        //parameters[0] es request, parameters[1] es response
        parameters[1]
          .status(500)
          .send({ status: 'error', message: error.message })
      }
    })
  }

  //TODO: Customizar y definir bien todos los tipos de errores y aplicarlos en los controladores que usan c/u de mis routers
  generateCustomResponse = (request, response, next) => {
    response.sendSuccess = (payload) =>
      response.status(200).send({ status: 'success', payload })

    response.sendServerError = (error) =>
      response.status(500).send({ status: 'error', error: error.message })

    response.sendUserError = (error) =>
      response.status(400).send({ status: 'error', error: error.message })

    next()
  }

  handlePolicies = (policies) => (request, response, next) => {
    if (policies[0] === 'PUBLIC') return next()

    const tokenHeader = request.headers.accesstoken

    if (!tokenHeader)
      return response
        .status(403)
        .send({ status: 'error', error: 'No se encontró token de acceso' })

    const accessToken = tokenHeader.split(' ')[1]

    try {
      //TODO: Resolver por qué el token llega con "Invalid Signature"
      const { user } = jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY)

      if (!policies.includes(user.role.toUpperCase()))
        return response.status(403).send({
          status: 'error',
          error: 'El usuario no posee los permisos para acceder a este recurso',
        })

      request.user = user
      next()
    } catch (error) {
      response.status(403).send('Token de acceso inválido: ' + error.message)
    }
  }

  //Al pasar un spread como parámetro me queda: get(path, [cb1, cb2, ...,])
  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }
}

module.exports = CustomRouter
