const chai = require('chai')
const supertest = require('supertest')

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

    it('El endpoint GET /api/sessions/githublogin autenticará a un usuario en la aplicación presentando este sus credenciales de github, también debe settear una cookie de nombre authorization con un JWT para ese usuario y redireccionar con un código 302 a la vista de productos', async () => {
      const result = requester.get('/api/sessions/githublogin')
      console.log('RESULT', result)
    })
  })
})
