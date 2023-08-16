const chai = require("chai");
const supertest = require("supertest");
const { faker } = require("@faker-js/faker");

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Ciclo de testing de Power Comics", () => {
  let authorizationCookie;
  describe("Apartado de Sessions", () => {
    it("POST /api/sessions/login debe autenticar a un usuario con credenciales correctas, settear una cookie de nombre authorization con un JWT para ese usuario y redireccionar con un código 302 a la vista de productos", async () => {
      let adminCredentials = {
        email: "andresgabriel.92@gmail.com",
        password: "123",
      };

      const loginResponse = await requester
        .post("/api/sessions/login")
        .send(adminCredentials);

      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).to.be.ok;

      authorizationCookie = {
        name: cookies[0].split("=")[0],
        value: cookies[0].split("=")[1].split(";")[0],
      };

      // Verifica la creación de la cookie de acceso
      expect(authorizationCookie.name).to.be.ok.and.equal("Authorization");

      // Verifica la redirección
      expect(loginResponse.statusCode).to.be.equal(302);
      expect(loginResponse.text).to.be.equal("Found. Redirecting to /products");
      expect(loginResponse.headers.location).to.equal("/products");
    });

    it("GET /api/sessions/logout debe eliminar la cookie de autenticación y redirigir a la vista /login", async () => {
      const logoutResponse = await requester.get("/api/sessions/logout");

      const cookies = logoutResponse.headers["set-cookie"];

      const authorizationCookie = cookies.find((cookie) =>
        cookie.startsWith("Authorization=")
      );

      expect(authorizationCookie).to.exist;

      // Verifica que el valor de la cookie sea una cadena vacía o null (según lo que retorne el navegador)
      const cookieValue = authorizationCookie.split(";")[0].split("=")[1];
      expect(cookieValue).to.be.oneOf(["", null]);

      // Verifica la redirección
      expect(logoutResponse.statusCode).to.equal(302);
      expect(logoutResponse.headers.location).to.equal("/login");
    });

    /*it('GET /api/sessions/register deberá registrar a un usuario correctamente y guardarlo en la base de datos', async () => {
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
    })*/
  });

  describe("Apartado de Products", () => {
    it("POST /api/products/ debe crear un nuevo producto basado en las propiedades recibidas en el body", async () => {
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
      };

      const createProductResponse = await requester
        .post("/api/products")
        .set("Authorization", `Bearer ${authorizationCookie.value}`)
        .send(fakeProduct);

      fakeProduct._id = createProductResponse.body.payload.newProduct._id;

      expect(createProductResponse.ok).to.be.equal(true);
      expect(createProductResponse.statusCode).to.be.equal(200);
      expect(createProductResponse.body.payload.newProduct._id).to.be.ok;
      expect(createProductResponse.body.payload.newProduct.title).to.be.equal(
        fakeProduct.title
      );
    });

    it("GET /api/products/:id debe traer un producto cuyo ID sea el recibido por parámetro", async () => {
      const { statusCode, body } = await requester
        .get(`/api/products/${fakeProduct._id}`)
        .set("Authorization", `Bearer ${authorizationCookie.value}`);

      expect(statusCode).to.be.equal(200);
      expect(body.payload.product._id).to.be.ok.and.equal(fakeProduct._id);
      expect(body.payload.product.title).to.be.equal(fakeProduct.title);
      expect(body.payload.product.code).to.be.equal(fakeProduct.code);
    });

    it("PUT /api/products/:id debe modificar un producto existente basado en las propiedades recibidas en el body", async () => {
      const newFakeProperties = {
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        price: parseInt(faker.commerce.price()),
        stock: faker.string.numeric(),
      };

      const { statusCode, body } = await requester
        .put(`/api/products/${fakeProduct._id}`)
        .set("Authorization", `Bearer ${authorizationCookie.value}`)
        .send(newFakeProperties);

      expect(statusCode).to.be.equal(200);
      expect(body.payload.updatedProduct._id).to.be.ok.and.equal(
        fakeProduct._id
      );
      expect(body.payload.updatedProduct.title).to.be.equal(fakeProduct.title);
      expect(body.payload.updatedProduct.description).to.be.equal(
        newFakeProperties.description
      );
      expect(body.payload.updatedProduct.category).to.be.equal(
        newFakeProperties.category
      );
      expect(parseInt(body.payload.updatedProduct.price)).to.be.equal(
        newFakeProperties.price
      );
      expect(parseInt(body.payload.updatedProduct.stock)).to.be.equal(
        parseInt(newFakeProperties.stock)
      );
    });

    it("DELETE /api/products/:id debe eliminar un producto existente que cuyo ID sea el que se recibe por parámetro", async () => {
      const { statusCode, body } = await requester
        .delete(`/api/products/${fakeProduct._id}`)
        .set("Authorization", `Bearer ${authorizationCookie.value}`);

      expect(statusCode).to.be.equal(200);
      expect(body.payload.deletedProduct._id).to.be.ok.and.equal(
        fakeProduct._id
      );
    });

    it("GET /api/products/ debe mostrar todos los productos de la base de datos junto con las opciones de paginación", async () => {
      const getProductsResponse = await requester
        .get("/api/products")
        .set("Authorization", `Bearer ${authorizationCookie.value}`);

      expect(getProductsResponse.ok).to.be.equal(true);
      expect(getProductsResponse.statusCode).to.be.equal(200);
    });
  });

  describe("Apartado de Carts", () => {
    let fakeProducts = [];

    it("PUT /api/carts/:cid/ debe actualizar la totalidad de los productos de un carrito cuyo ID recibe por parámetro", async () => {
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
        };

        let { body } = await requester
          .post("/api/products")
          .set("Authorization", `Bearer ${authorizationCookie.value}`)
          .send(fakeProduct);

        fakeProducts.push({
          product: body.payload.newProduct._id,
          quantity: 10,
        });
      }

      const result = await requester
        .put("/api/carts/64b01849a730abd167e29da5")
        .set("Authorization", `Bearer ${authorizationCookie.value}`)
        .send({ products: fakeProducts });

      expect(result.statusCode).to.be.equal(200);

      for (let i = 0; i < 3; i++) {
        expect(
          fakeProducts[i].product ===
            result.body.payload.updatedCart.products[i].product
        ).to.be.true;

        fakeProducts[i].product;

        await requester
          .delete(`/api/products/${fakeProducts[i].product}`)
          .set("Authorization", `Bearer ${authorizationCookie.value}`);
      }

      fakeProducts = [];
    });
  });
});
