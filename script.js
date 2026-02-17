let menu = [];
let currentDeck = [];
let currentIndex = 0;

let liked = [];
let ordered = [];
let historyStack = [];

const card = document.getElementById("card");
const undoButton = document.getElementById("undoButton");
const cartButton = document.getElementById("cartButton");
const orderCount = document.getElementById("orderCount");
const appDiv = document.getElementById("app");

fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    startNewRound(menu.slice());
  });

function startNewRound(deck) {
  currentDeck = deck;
  currentIndex = 0;
  showItem();
}

function showItem() {
  if (currentIndex >= currentDeck.length) {
    if (liked.length > 0) {
      startNewRound(liked.slice());
      liked = [];
      return;
    } else {
      showCart();
      return;
    }
  }

  let item = currentDeck[currentIndex];

  document.getElementById("itemName").textContent = item.name;
  document.getElementById("itemDesc").textContent = item.description;
  document.getElementById("itemPrice").textContent = item.price;
  document.getElementById("itemImage").src = item.image;

  card.style.transform = "translate(0,0)";
  card.style.opacity = "1";

  updateOrderCount();
}

function updateOrderCount() {
  orderCount.textContent = "Ordered: " + ordered.length;
}

let startX = 0;
let startY = 0;

card.addEventListener("pointerdown", e => {
  startX = e.clientX;
  startY = e.clientY;
  card.setPointerCapture(e.pointerId);
});

card.addEventListener("pointermove", e => {
  if (!startX) return;

  let deltaX = e.clientX - startX;
  let deltaY = e.clientY - startY;

  card.style.transform =
    `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.05}deg)`;
});

card.addEventListener("pointerup", e => {
  let deltaX = e.clientX - startX;
  let deltaY = e.clientY - startY;

  let item = currentDeck[currentIndex];

  if (deltaX > 100) {
    liked.push(item);
    historyStack.push({type: "like", item});
    swipeAway(500, 0);
  }
  else if (deltaX < -100) {
    historyStack.push({type: "skip", item});
    swipeAway(-500, 0);
  }
  else if (deltaY < -100) {
    ordered.push(item);
    historyStack.push({type: "order", item});
    swipeAway(0, -500);
  }
  else {
    card.style.transform = "translate(0,0)";
  }

  startX = 0;
  startY = 0;
});

function swipeAway(x, y) {
  card.style.transform = `translate(${x}px, ${y}px)`;
  card.style.opacity = "0";

  setTimeout(() => {
    currentIndex++;
    showItem();
  }, 300);
}

undoButton.onclick = () => {
  if (historyStack.length === 0) return;

  let last = historyStack.pop();

  if (last.type === "like") liked.pop();
  if (last.type === "order") ordered.pop();

  currentIndex--;
  showItem();
};

cartButton.onclick = () => {
  showCart();
};

function showCart() {

  let total = ordered.reduce((sum, item) =>
    sum + priceToNumber(item.price), 0);

  let html = "<h2>Your Cart</h2>";

  html += '<div style="max-height:400px; overflow-y:auto;">';

  ordered.forEach(item => {
    html += `
      <div style="display:flex;align-items:center;margin-bottom:10px;">
        <img src="${item.image}"
          style="width:70px;height:70px;object-fit:cover;
          border-radius:8px;margin-right:10px;">
        <div>
          <strong>${item.name}</strong><br>
          ${item.price}
        </div>
      </div>
    `;
  });

  html += "</div>";

  html += `<h3>Total: $${total.toFixed(2)}</h3>`;

  html += `
    <button onclick="location.reload()">Start Over</button>
  `;

  appDiv.innerHTML = html;
}

function priceToNumber(price) {
  return parseFloat(price.replace("$","")) || 0;
}
