const chai = require('chai')
const supertest = require('supertest')
const { faker } = require('@faker-js/faker')

const expect = chai.expect
const requester = supertest('http://localhost:8080', { timeout: 10000 })

describe('Ciclo de testing de Power Comics', async () => {
  let adminAuthorizationCookie
  let userAuthorizationCookie
  const fakeUserPass = faker.internet.password()
  let fakeUser = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 99 }),
    password: fakeUserPass,
    role: 'User',
  }

  describe('Apartado de Sessions', () => {
    it('POST /api/sessions/login debe autenticar a un usuario con credenciales correctas, settear una cookie de nombre authorization con un JWT para ese usuario y redireccionar con un código 302 a la vista de productos', async () => {
      let adminCredentials = {
        email: 'andresgabriel.92@gmail.com',
        password: '123',
      }

      const loginResponse = await requester
        .post('/api/sessions/login')
        .send(adminCredentials)

      const cookies = loginResponse.headers['set-cookie']
      expect(cookies).to.be.ok

      adminAuthorizationCookie = {
        name: cookies[0].split('=')[0],
        value: cookies[0].split('=')[1].split(';')[0],
      }

      // Verifica la creación de la cookie de acceso
      expect(adminAuthorizationCookie.name).to.be.ok.and.equal('Authorization')

      // Verifica la redirección
      expect(loginResponse.statusCode).to.be.equal(302)
      expect(loginResponse.text).to.be.equal('Found. Redirecting to /products')
      expect(loginResponse.headers.location).to.equal('/products')
    })

    it('GET /api/sessions/logout debe eliminar la cookie de autenticación y redirigir a la vista /login', async () => {
      const logoutResponse = await requester.get('/api/sessions/logout')

      const cookies = logoutResponse.headers['set-cookie']

      const adminAuthorizationCookie = cookies.find((cookie) =>
        cookie.startsWith('Authorization=')
      )

      expect(adminAuthorizationCookie).to.exist

      // Verifica que el valor de la cookie sea una cadena vacía o null (según lo que retorne el navegador)
      const cookieValue = adminAuthorizationCookie.split(';')[0].split('=')[1]
      expect(cookieValue).to.be.oneOf(['', null])

      // Verifica la redirección
      expect(logoutResponse.statusCode).to.equal(302)
      expect(logoutResponse.headers.location).to.equal('/login')
    })

    it('GET /api/sessions/register deberá registrar a un usuario correctamente y guardarlo en la base de datos', async () => {
      const regiserResponse = await requester
        .post('/api/sessions/register')
        .send(fakeUser)

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

      fakeUser = regiserResponse.body.newUser
    })
  })

  describe('Apartado de Products', () => {
    let fakeProduct = {
      title: faker.commerce.productName(),
      code:
        faker.string.alpha({ count: 3 }).toLowerCase() +
        faker.number.int({ min: 1, max: 100 }),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      price: faker.commerce.price(),
      stock: faker.string.numeric(),
      status: faker.datatype.boolean(0.6),
      thumbnails: [faker.image.url()],
    }

    it('POST /api/products/ debe crear un nuevo producto basado en las propiedades recibidas en el body', async () => {
      const createProductResponse = await requester
        .post('/api/products')
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)
        .send(fakeProduct)

      fakeProduct._id = createProductResponse.body.payload.newProduct._id

      expect(createProductResponse.ok).to.be.equal(true)
      expect(createProductResponse.statusCode).to.be.equal(200)
      expect(createProductResponse.body.payload.newProduct._id).to.be.ok
      expect(createProductResponse.body.payload.newProduct.title).to.be.equal(
        fakeProduct.title
      )
    })

    it('GET /api/products/:id debe traer un producto cuyo ID sea el recibido por parámetro', async () => {
      const { statusCode, body } = await requester
        .get(`/api/products/${fakeProduct._id}`)
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)

      expect(statusCode).to.be.equal(200)
      expect(body.payload.product._id).to.be.ok.and.equal(fakeProduct._id)
      expect(body.payload.product.title).to.be.equal(fakeProduct.title)
      expect(body.payload.product.code).to.be.equal(fakeProduct.code)
    })

    it('PUT /api/products/:id debe modificar un producto existente basado en las propiedades recibidas en el body', async () => {
      const newFakeProperties = {
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        price: parseInt(faker.commerce.price()),
        stock: faker.string.numeric(),
      }

      const { statusCode, body } = await requester
        .put(`/api/products/${fakeProduct._id}`)
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)
        .send(newFakeProperties)

      expect(statusCode).to.be.equal(200)
      expect(body.payload.updatedProduct._id).to.be.ok.and.equal(
        fakeProduct._id
      )
      expect(body.payload.updatedProduct.title).to.be.equal(fakeProduct.title)
      expect(body.payload.updatedProduct.description).to.be.equal(
        newFakeProperties.description
      )
      expect(body.payload.updatedProduct.category).to.be.equal(
        newFakeProperties.category
      )
      expect(parseInt(body.payload.updatedProduct.price)).to.be.equal(
        newFakeProperties.price
      )
      expect(parseInt(body.payload.updatedProduct.stock)).to.be.equal(
        parseInt(newFakeProperties.stock)
      )
    })

    it('DELETE /api/products/:id debe eliminar un producto existente que cuyo ID sea el que se recibe por parámetro', async () => {
      const { statusCode, body } = await requester
        .delete(`/api/products/${fakeProduct._id}`)
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)

      expect(statusCode).to.be.equal(200)
      expect(body.payload.deletedProduct._id).to.be.ok.and.equal(
        fakeProduct._id
      )
    })

    it('GET /api/products/ debe mostrar todos los productos de la base de datos junto con las opciones de paginación', async () => {
      const getProductsResponse = await requester
        .get('/api/products')
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)

      expect(getProductsResponse.ok).to.be.equal(true)
      expect(getProductsResponse.statusCode).to.be.equal(200)
    })
  })

  describe('Apartado de Carts', () => {
    let fakeProducts = []

    it('GET /api/carts/ debe mostrar todos los carritos de la base de datos junto con las opciones de paginación', async () => {
      const { ok, body, statusCode } = await requester
        .get('/api/carts')
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)

      expect(ok).to.be.equal(true)
      expect(statusCode).to.be.equal(200)

      let search = body.payload.carts.find(
        (cart) => cart._id === fakeUser.cart._id
      )

      expect(search._id).to.equal(fakeUser.cart._id)
    })

    it('GET /api/carts/:id debe traer un carrito cuyo ID sea el recibido por parámetro', async () => {
      const { statusCode, body } = await requester
        .get(`/api/carts/${fakeUser.cart._id}`)
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)

      expect(statusCode).to.be.equal(200)
      expect(body.payload.cart._id).to.be.ok.and.equal(fakeUser.cart._id)
    })

    it('PUT /api/carts/:cid/ debe actualizar la totalidad de los productos de un carrito cuyo ID recibe por parámetro', async () => {
      //Creo tres productos nuevos
      for (let i = 0; i < 3; i++) {
        let fakeProduct = {
          title: faker.commerce.productName(),
          code:
            faker.string.alpha({ count: 3 }).toLowerCase() +
            faker.number.int({ min: 1, max: 100 }),
          description: faker.commerce.productDescription(),
          category: faker.commerce.department(),
          price: faker.commerce.price(),
          stock: 50,
          status: faker.datatype.boolean(0.6),
          thumbnails: [faker.image.url()],
        }

        let { body } = await requester
          .post('/api/products')
          .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)
          .send(fakeProduct)

        fakeProducts.push({
          product: body.payload.newProduct._id,
          quantity: 10,
        })
      }

      //Los añado al carrito
      const result = await requester
        .put(`/api/carts/${fakeUser.cart._id}`)
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)
        .send({ products: fakeProducts })

      expect(result.statusCode).to.be.equal(200)

      //Valido que los 3 productos estén en el carrito
      for (let i = 0; i < 3; i++) {
        expect(
          fakeProducts[i].product ===
            result.body.payload.updatedCart.products[i].product
        ).to.be.true
      }
    })

    it('POST /api/carts/:cid/product/:pid debe agregar la cantidad indicada en el body de la petición al carrito de compras, si no había unidades existentes del producto, deberá agregarlo con la cantidad indicada', async () => {
      //Me autentico con el usuario propietario del carrito
      const loginResponse = await requester
        .post('/api/sessions/login')
        .send({ email: fakeUser.email, password: fakeUserPass })

      const cookies = loginResponse.headers['set-cookie']
      expect(cookies).to.be.ok

      userAuthorizationCookie = {
        name: cookies[0].split('=')[0],
        value: cookies[0].split('=')[1].split(';')[0],
      }

      //Agrego un producto que si estaba en el carrito
      const { body, statusCode } = await requester
        .post(
          `/api/carts/${fakeUser.cart._id}/product/${fakeProducts[0].product}`
        )
        .set('Authorization', `Bearer ${userAuthorizationCookie.value}`)
        .send({ quantity: 5 })

      //Valido que la cantidad del producto [0] sea la correcta y que las cantidades del resto de los productos estén inalteradas
      expect(statusCode).to.be.ok.and.equal(200)
      expect(body.payload.cart._id).to.be.equal(fakeUser.cart._id)
      expect(body.payload.cart.products[0].quantity).to.be.equal(15)
      expect(body.payload.cart.products[1].quantity).to.be.equal(10)
      expect(body.payload.cart.products[2].quantity).to.be.equal(10)

      for (let i = 0; i < 3; i++) {
        await requester
          .delete(`/api/products/${fakeProducts[i].product}`)
          .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)
      }

      await requester
        .delete(`/api/users/${fakeUser._id}`)
        .set('Authorization', `Bearer ${adminAuthorizationCookie.value}`)
    })
  })
})
