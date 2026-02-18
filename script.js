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
    if (ordered.length > 0) showCart(); // auto-show cart when done
    return;
  }

  if (index >= workingMenu.length) {
    if (saved.length > 0) {
      workingMenu = [...saved];
      saved = [];
      index = 0;
    } else {
      card.style.display = "none";
      if (ordered.length > 0) showCart();
      return;
    }
  }

  const item = workingMenu[index];
  nameEl.textContent = item.name;
  descEl.textContent = item.description;
  priceEl.textContent = "$" + item.price;
  imageEl.src = "images/" + item.image;
  card.style.display = "block";

  // ADHD-friendly highlight
  card.classList.remove("highlight");
  void card.offsetWidth;
  card.classList.add("highlight");
}

function nextItem() {
  index++;
  showItem();
}

function updateCart() {
  cartButton.textContent = `Cart (${ordered.length})`;
}

// Show cart function with total
function showCart() {
  cartView.classList.remove("hidden");

  let html = "<h3>Your Order</h3>";
  let total = 0;

  if (ordered.length === 0) {
    html += "<p>No items yet</p>";
  } else {
    ordered.forEach(i => {
      total += parseFloat(i.price);
      html += `
        <div class="cart-item">
          <img src="images/${i.image}" alt="${i.name}">
          <span>${i.name} - $${i.price}</span>
        </div>
      `;
    });
    html += `<p class="cart-total"><strong>Total: $${total.toFixed(2)}</strong></p>`;
  }

  html += `<br><button id="startOver">Start Over</button>`;
  cartView.innerHTML = html;

  const startOverBtn = document.getElementById("startOver");
  startOverBtn.addEventListener("click", () => {
    workingMenu = [...menu];
    saved = [];
    ordered = [];
    index = 0;
    updateCart();
    showItem();
    cartView.classList.add("hidden");
  });
}

// Cart button click
cartButton.addEventListener("click", showCart);

// Swipe logic with visual movement
let startX = 0;
let startY = 0;

card.addEventListener("touchstart", e => {
  startX = e.changedTouches[0].screenX;
  startY = e.changedTouches[0].screenY;
});

card.addEventListener("touchmove", e => {
  if (!startX) return;
  let moveX = e.changedTouches[0].screenX - startX;
  let moveY = e.changedTouches[0].screenY - startY;
  card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.05}deg)`;
});

card.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].screenX;
  let endY = e.changedTouches[0].screenY;

  let diffX = endX - startX;
  let diffY = endY - startY;

  const threshold = 50;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > threshold) {
      saved.push(workingMenu[index]);
      swipeCard(500, 0);
    } else if (diffX < -threshold) {
      swipeCard(-500, 0);
    } else {
      resetCardPosition();
    }
  } else {
    if (diffY < -threshold) {
      ordered.push(workingMenu[index]);
      updateCart();
      swipeCard(0, -500);
    } else {
      resetCardPosition();
    }
  }
});

function swipeCard(x, y) {
  card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  card.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.05}deg)`;
  card.style.opacity = "0";

  setTimeout(() => {
    card.style.transition = "none";
    card.style.transform = "translate(0,0)";
    card.style.opacity = "1";
    index++;
    showItem();
  }, 300);
}

function resetCardPosition() {
  card.style.transition = "transform 0.2s ease";
  card.style.transform = "translate(0,0)";
  }
