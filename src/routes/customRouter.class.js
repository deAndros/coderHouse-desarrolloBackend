const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { logger } = require('../config/logger.config')
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
        logger.error(error.message)
        //parameters[0] es request, parameters[1] es response
        parameters[1]
          .status(500)
          .send({ status: 'error', message: error.message })
      }
    })
  }

  //TODO: Customizar y definir bien todos los tipos de errores y aplicarlos en los controladores que usan c/u de mis routers
  generateCustomResponse = (request, response, next) => {
    response.sendSuccess = (payload) => {
      request.logger.http(`Response 200 to ${request.method}: ${request.path}`)

      response.status(200).send({ status: 'SUCCESS', payload })
    }

    response.sendCreated = (payload) => {
      request.logger.http(`Response 201 to ${request.method}: ${request.path}`)

      response.status(201).send({ status: 'CREATED', payload })
    }

    response.sendInternalServerError = (error) => {
      request.logger.http(`Response 500 to ${request.method}: ${request.path}`)
      response.status(500).send({ status: 'ERROR', error: error })
    }

    response.sendBadRequest = (error) => {
      request.logger.http(`Response 400 to ${request.method}: ${request.path}`)

      response.status(400).send({ status: 'ERROR', error: error.message })
    }

    response.sendNotAuthenticated = (error) => {
      request.logger.http(`Response 401 to ${request.method}: ${request.path}`)

      response.status(401).send({ status: 'ERROR', error: error.message })
    }

    response.sendUnauthorized = (error) => {
      request.logger.http(`Response 403 to ${request.method}: ${request.path}`)

      response.status(403).send({ status: 'ERROR', error: error.message })
    }

    response.setCookieAndRedirect = (
      cookieName,
      cookieValue,
      cookieConfig,
      redirectUrl
    ) => {
      request.logger.http(`Response 301 to ${request.method}: ${request.path}`)

      response
        .cookie(cookieName, cookieValue, cookieConfig)
        .redirect(redirectUrl)
    }

    response.destroyCookieAndRedirect = (cookieName, redirectUrl) => {
      request.logger.http(`Response 301 to ${request.method}: ${request.path}`)

      response.clearCookie(cookieName).redirect(redirectUrl)
    }

    next()
  }

  handlePolicies = (policies) => (request, response, next) => {
    try {
      if (policies[0] === 'PUBLIC') return next()

      let accessToken = request.cookies['Authorization']
      let tokenHeader = request.headers.authorization

      if (!accessToken && !tokenHeader)
        return response.status(403).send({
          status: 'error',
          error: 'No se encontró token de acceso',
        })

      if (!accessToken) {
        accessToken = tokenHeader.split(' ')[1]
      }

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
