let menu = [];
let index = 0;

const nameEl = document.getElementById("itemName");
const descEl = document.getElementById("itemDesc");
const priceEl = document.getElementById("itemPrice");
const imageEl = document.getElementById("itemImage");
const card = document.getElementById("card");

fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    showItem();
  })
  .catch(err => console.error(err));

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
    if (diffX > 50 || diffX < -50) {
      nextItem();
    }
  } else {
    if (diffY < -50) {
      nextItem();
    }
  }
});
