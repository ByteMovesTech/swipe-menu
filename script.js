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

  let swipeType = null;

  if (dy < -60 && absY > absX) {
    // swipe up → order
    ordered.push(menu[currentIndex]);
    swipeType = "up";
    updateCartDisplay();
    swipeAway(0, -600);
  }
  else if (dx > 80 && absX > absY) {
    // swipe right → like
    liked.push(menu[currentIndex]);
    swipeType = "right";
    swipeAway(600, 0);
  }
  else if (dx < -80 && absX > absY) {
    // swipe left → discard
    swipeType = "left";
    swipeAway(-600, 0);
  }
  else {
    card.style.transform = "translate(0,0)";
    startX = 0;
    startY = 0;
    return;
  }

  // save swipe to history
  historyStack.push({ index: currentIndex, type: swipeType });
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
