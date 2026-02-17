let menu = [];
let currentIndex = 0;
let liked = [];
let ordered = [];
let historyStack = [];

const card = document.getElementById("card");
const orderCount = document.getElementById("orderCount");
const cartButton = document.getElementById("cartButton");
const undoBtn = document.getElementById("undoBtn");

fetch("./menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    showItem();
  });

function showItem() {
  if (currentIndex >= menu.length) {
    currentIndex = menu.length - 1;
    return;
  }

  const item = menu[currentIndex];

  document.getElementById("itemName").textContent = item.name;
  document.getElementById("itemDesc").textContent = item.description;
  document.getElementById("itemPrice").textContent = item.price;
  document.getElementById("itemImage").src = item.image;

  card.style.transform = "translate(0,0)";
  card.style.opacity = "1";
}

function priceToNumber(price) {
  return Number(price.replace("$",""));
}

function updateCartDisplay() {
  orderCount.textContent = "Ordered: " + ordered.length;

  let total = ordered.reduce((sum, item) => {
    return sum + priceToNumber(item.price);
  }, 0);

  cartButton.textContent = `Cart (${ordered.length} – $${total})`;
}

let startX = 0;
let startY = 0;

card.addEventListener("pointerdown", e => {
  startX = e.clientX;
  startY = e.clientY;
  card.setPointerCapture(e.pointerId);
});

card.addEventListener("pointermove", e => {
  if (startX === 0 && startY === 0) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg)`;
});

card.addEventListener("pointerup", e => {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  historyStack.push(currentIndex);

  if (dy < -60 && absY > absX) {
    ordered.push(menu[currentIndex]);
    updateCartDisplay();
    swipeAway(0, -600);
  }
  else if (dx > 80 && absX > absY) {
    liked.push(menu[currentIndex]);
    swipeAway(600, 0);
  }
  else if (dx < -80 && absX > absY) {
    swipeAway(-600, 0);
  }
  else {
    card.style.transform = "translate(0,0)";
    historyStack.pop();
  }

  startX = 0;
  startY = 0;
});

function swipeAway(x, y) {
  card.style.transform = `translate(${x}px, ${y}px)`;
  card.style.opacity = "0";

  setTimeout(() => {
    currentIndex++;
    if (currentIndex < menu.length) showItem();
  }, 300);
}

undoBtn.onclick = () => {
  if (historyStack.length === 0) return;

  currentIndex = historyStack.pop();

  const lastOrdered = ordered[ordered.length - 1];
  if (lastOrdered && lastOrdered === menu[currentIndex]) {
    ordered.pop();
    updateCartDisplay();
  }

  showItem();
};

cartButton.onclick = () => {
  const app = document.querySelector(".app");

  let total = ordered.reduce((sum, item) => {
    return sum + priceToNumber(item.price);
  }, 0);

  let html = "<h2>Your Cart</h2>";

  ordered.forEach(item => {
    html += `
      <div style="margin-bottom:15px;">
        <img src="${item.image}" style="width:100%;border-radius:8px;">
        <p><strong>${item.name}</strong> – ${item.price}</p>
      </div>
    `;
  });

  html += `<h3>Total: $${total}</h3>`;
  html += `<button onclick="location.reload()">Start Over</button>`;

  app.innerHTML = html;
};
