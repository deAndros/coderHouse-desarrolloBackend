const chai = require('chai')
const supertest = require('supertest')

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Ciclo de testing de Power Comics', () => {
  let cookie
  describe('Apartado de Sessions', () => {
    it('El endpoint POST /api/login debe autenticar a un usuario con credenciales correctas, settear una cookie de nombre authorization con un JWT para ese usuario y redireccionar con un código 302 a la vista de productos', async () => {
      let adminCredentials = {
        email: 'andresgabriel.92@gmail.com',
        password: '123',
      }

      const loginResponse = await requester
        .post('/api/sessions/login')
        .send(adminCredentials)

      const cookieResult = loginResponse.headers['set-cookie'][0]
      expect(cookieResult).to.be.ok

      cookie = {
        name: cookieResult.split('=')[0],
        value: cookieResult.split('=')[1],
      }

      expect(cookie.name).to.be.ok.and.equal('Authorization')
      expect(loginResponse.statusCode).to.be.equal(302)
      expect(loginResponse.text).to.be.equal('Found. Redirecting to /products')
    })
  })
})
