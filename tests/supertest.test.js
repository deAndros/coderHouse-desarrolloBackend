const chai = require('chai')
const supertest = require('supertest')
const { faker } = require('@faker-js/faker')

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Ciclo de testing de Power Comics', () => {
  let authorizationCookie
  describe('Apartado de Sessions', () => {
    it('El endpoint POST /api/sessions/login debe autenticar a un usuario con credenciales correctas, settear una cookie de nombre authorization con un JWT para ese usuario y redireccionar con un código 302 a la vista de productos', async () => {
      let adminCredentials = {
        email: 'andresgabriel.92@gmail.com',
        password: '123',
      }

      const loginResponse = await requester
        .post('/api/sessions/login')
        .send(adminCredentials)

      const cookies = loginResponse.headers['set-cookie']
      expect(cookies).to.be.ok

      authorizationCookie = {
        name: cookies[0].split('=')[0],
        value: cookies[0].split('=')[1],
      }

      // Verifica la creación de la cookie de acceso
      expect(authorizationCookie.name).to.be.ok.and.equal('Authorization')

      // Verifica la redirección
      expect(loginResponse.statusCode).to.be.equal(302)
      expect(loginResponse.text).to.be.equal('Found. Redirecting to /products')
      expect(loginResponse.headers.location).to.equal('/products')
    })

    it('El endpoint GET /api/sessions/logout debe eliminar la cookie de autenticación y redirigir a la vista /login', async () => {
      const logoutResponse = await requester.get('/api/sessions/logout')

      const cookies = logoutResponse.headers['set-cookie']

      const authorizationCookie = cookies.find((cookie) =>
        cookie.startsWith('Authorization=')
      )

      expect(authorizationCookie).to.exist

      // Verifica que el valor de la cookie sea una cadena vacía o null (según lo que retorne el navegador)
      const cookieValue = authorizationCookie.split(';')[0].split('=')[1]
      expect(cookieValue).to.be.oneOf(['', null])

      // Verifica la redirección
      expect(logoutResponse.statusCode).to.equal(302)
      expect(logoutResponse.headers.location).to.equal('/login')
    })

    it('El endpoint GET /api/sessions/register deberá registrar a un usuario correctamente y guardarlo en la base de datos', async () => {
      const fakeUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 99 }), // Genera un número aleatorio entre 18 y 99
        password: faker.internet.password(),
        isAdmin: 'on',
      }

      const regiserResponse = await requester
        .post('/api/sessions/register')
        .send(fakeUser)

      console.log('fakeUser', fakeUser)
      console.log('result.body', regiserResponse.body)

      expect(regiserResponse.statusCode).to.be.equal(200)
      expect(regiserResponse.body.status).to.be.ok.and.equal('success')
      expect(regiserResponse.body.newUser.first_name).to.be.ok.and.equal(
        fakeUser.firstName
      )
      expect(regiserResponse.body.newUser.last_name).to.be.ok.and.equal(
        fakeUser.lastName
      )
      expect(regiserResponse.body.newUser.email).to.be.ok.and.equal(
        fakeUser.email
      )
      expect(regiserResponse.body.newUser.age).to.be.ok.and.equal(fakeUser.age)
    })
  })
})
