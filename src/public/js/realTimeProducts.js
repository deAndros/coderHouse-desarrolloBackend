console.log("Real Time Products");
const socket = io();

const renderProducts = (data) => {
  let productsTable = document
    .getElementById("productsTable")
    .getElementsByTagName("tbody")[0];

  let productRows = "";

  data.forEach((product) => {
    productRows += `<tr>
        <td class="tg-0lax">${product.title}</td>
        <td class="tg-0lax">${product.price}</td>
        <td class="tg-0lax">${product.code}</td>
        <td class="tg-0lax">${product.stock}</td>
      </tr>`;
  });

  productsTable.innerHTML = productRows;

  return productsTable;
};

socket.on("products", (data) => {
  console.log("ESTOS SON MIS PRODUCTOS", data);

  renderProducts(data);
});
