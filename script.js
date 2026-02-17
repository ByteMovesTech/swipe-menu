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
    alert("Failed to load menu.json");
    console.error(err);
  });

function showItem() {
  if (menu.length === 0) return;

  const item = menu[index];

  nameEl.textContent = item.name;
  descEl.textContent = item.description;
  priceEl.textContent = "$" + item.price;
  imageEl.src = "images/" + item.image;
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
      console.log("Right swipe");
      nextItem();
    } else if (diffX < -50) {
      console.log("Left swipe");
      nextItem();
    }
  } else {
    if (diffY < -50) {
      console.log("Up swipe (order)");
      alert("Ordered: " + menu[index].name);
      nextItem();
    }
  }
});
