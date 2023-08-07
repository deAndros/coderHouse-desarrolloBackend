const chai = require('chai')
const supertest = require('supertest')

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Ciclo de testing de Power Comics', () => {
  describe('Apartado de Sessions', () => {
    it('El endpoint POST /api/login debe autenticar a un usuario con credenciales correctas y otorgarle un token de acceso', async () => {
      let cookie
      let adminCredentials = {
        email: 'andresgabriel.92@gmail.com',
        password: '123',
      }

      const response = await requester
        .post('/api/sessions/login')
        .send(adminCredentials)

      cookie = response.headers['set-cookie'][0].split('=')[1]
      console.log('COOKIE', cookie)
      console.log('RESPONSE', response)

      //const {statusCode, _body, ok} = await requester.get('/api/products')

      //expect(statusCode).to.be.equal(200)
    })
  })
})
