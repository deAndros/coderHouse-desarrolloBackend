const { productModel } = require('./models/product.model');

class ProductManagerMongo {
  getProducts = async (limit = 5, page = 1, sort = 'asc') => {
    try {
      const sortOptions = {
        price: sort === 'asc' ? 1 : -1,
      };

      const products = await productModel.paginate(
        {},
        { page: page, limit: limit, lean: true }
      );

      return products.docs;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getProductById = async (id) => {
    try {
      const productFound = await productModel.findOne({ _id: id });

      if (!productFound)
        throw new Error('No existe un producto con el ID seleccionado');

      return productFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getProductByCode = async (code) => {
    try {
      return await productModel.findOne({ code: code });
    } catch (error) {
      throw new Error(error.message);
    }
  };

  addProduct = async (product) => {
    try {
      const productFound = await this.getProductByCode(product.code);

      if (productFound) {
        throw new Error(
          `El código ${product.code} ya se encuentra utilizado por otro producto.`
        );
      }
      return await productModel.create(product);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  updateProduct = async (id, product) => {
    try {
      if (product.id) {
        throw new Error('El ID no puede ser actualizado');
      }

      if (
        !product.title ||
        !product.code ||
        !product.description ||
        !product.category ||
        !product.price
      ) {
        throw new Error(
          'Los parámetros title, code, description, category y price son obligatorios'
        );
      }

      //Si el código ingresado es distinto al que tenía ese producto y a su vez existe otro producto con ese código arrojo un error.
      const hasRepeatedCode = await productModel.find({
        code: product.code,
        _id: { $ne: id },
      });

      if (hasRepeatedCode.length != 0) {
        throw new Error(
          `El código ${product.code} ya se encuentra utilizado por otro producto.`
        );
      }

      const productToBeReplaced = {
        title: product.title,
        code: product.code,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        thumbnails: product.thumbnails,
      };

      let result = await productModel.updateOne(
        { _id: id },
        productToBeReplaced
      );

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  deleteProduct = async (id) => {
    try {
      const productFound = await this.getProductById(id);

      if (!productFound) {
        throw new Error(`No existe un producto con ID igual a ${id}`);
      }

      let result = await productModel.deleteOne({ _id: id });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}

module.exports = ProductManagerMongo;
