let menu = [];
let workingMenu = [];
let index = 0;
let ordered = [];
let saved = [];

const nameEl = document.getElementById("itemName");
const descEl = document.getElementById("itemDesc");
const priceEl = document.getElementById("itemPrice");
const imageEl = document.getElementById("itemImage");
const card = document.getElementById("card");
const cartButton = document.getElementById("cartButton");
const cartView = document.getElementById("cartView");

// Load menu
fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    workingMenu = [...menu];
    showItem();
  })
  .catch(err => console.error("Failed to load menu:", err));

function showItem() {
  if (workingMenu.length === 0) {
    card.style.display = "none";
    return;
  }

  if (index >= workingMenu.length) {
    // Only show saved items next
    if (saved.length > 0) {
      workingMenu = [...saved];
      saved = [];
      index = 0;
    } else {
      card.style.display = "none"; // nothing left to show
      return;
    }
  }

  const item = workingMenu[index];
  nameEl.textContent = item.name;
  descEl.textContent = item.description;
  priceEl.textContent = "$" + item.price;
  imageEl.src = "images/" + item.image;
  card.style.display = "block";
}

function nextItem() {
  index++;
  showItem();
}

function updateCart() {
  cartButton.textContent = `Cart (${ordered.length})`;
}

cartButton.addEventListener("click", () => {
  cartView.classList.toggle("hidden");

  let html = "<h3>Your Order</h3>";

  if (ordered.length === 0) {
    html += "<p>No items yet</p>";
  } else {
    ordered.forEach(i => {
      html += `<p>${i.name} - $${i.price}</p>`;
    });
  }

  cartView.innerHTML = html;
});

// Swipe logic
let startX = 0;
let startY = 0;

card.addEventListener("touchstart", e => {
  startX = e.changedTouches[0].screenX;
  startY = e.changedTouches[0].screenY;
});

card.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].screenX;
  let endY = e.changedTouches[0].screenY;

  let diffX = endX - startX;
  let diffY = endY - startY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 50) {
      // Swipe right = save
      saved.push(workingMenu[index]);
      nextItem();
    } else if (diffX < -50) {
      // Swipe left = remove from next rounds
      workingMenu.splice(index, 1);
      // don't increment index because splice shifts array
      showItem();
    }
  } else {
    if (diffY < -50) {
      // Swipe up = order
      ordered.push(workingMenu[index]);
      // Remove from future rounds
      workingMenu.splice(index, 1);
      updateCart();
      showItem();
    }
  }
});
