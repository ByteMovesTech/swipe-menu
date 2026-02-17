let menu = [];
let index = 0;

const nameEl = document.getElementById("item-name");
const descEl = document.getElementById("item-description");
const priceEl = document.getElementById("item-price");
const imageEl = document.getElementById("item-image");
const card = document.getElementById("menu-card");

fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    showItem();
  })
  .catch(err => {
    console.error("Failed to load menu:", err);
  });

function showItem() {
  if (menu.length === 0) return;

  const item = menu[index];

  nameEl.textContent = item.name;
  descEl.textContent = item.description;
  priceEl.textContent = "$" + item.price;
  imageEl.src = "images/" + item.image;

  card.style.transform = "translate(0,0)";
  card.style.opacity = "1";
}

function nextItem() {
  index++;
  if (index >= menu.length) index = 0;
  showItem();
}

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
      // right swipe
      swipeAway(400, 0);
    } else if (diffX < -50) {
      // left swipe
      swipeAway(-400, 0);
    }
  } else {
    if (diffY < -50) {
      // up swipe = order (no popup)
      swipeAway(0, -400);
    }
  }
});

function swipeAway(x, y) {
  card.style.transform = `translate(${x}px, ${y}px)`;
  card.style.opacity = "0";

  setTimeout(() => {
    nextItem();
  }, 250);
}
