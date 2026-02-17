let cart = [];

fetch("menu.json")
  .then(response => response.json())
  .then(data => displayMenu(data))
  .catch(error => console.error("Failed to load menu:", error));

function displayMenu(items) {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <img src="images/${item.image}" alt="${item.name}">
      <div class="menu-title">${item.name}</div>
      <div class="menu-description">${item.description}</div>
      <div class="menu-price">$${item.price.toFixed(2)}</div>
      <button onclick="addToCart('${item.name}')">Add to Cart</button>
    `;

    container.appendChild(card);
  });
}

function addToCart(name) {
  cart.push(name);
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart-items");
  cartList.innerHTML = "";

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    cartList.appendChild(li);
  });
}
