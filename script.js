let menu = [];              // full menu from JSON
let workingMenu = [];       // items in current round
let nextRoundItems = [];    // right-swiped items for next round
let currentIndex = 0;
let ordered = [];
let historyStack = [];

const card = document.getElementById("card");
const orderCount = document.getElementById("orderCount");
const cartButton = document.getElementById("cartButton");
const undoBtn = document.getElementById("undoBtn");
const appDiv = document.querySelector(".app");

// Load menu from JSON
fetch("./menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    startNewRound(menu.slice());
  });

// Start a new round with given items
function startNewRound(items) {
  workingMenu = items;
  nextRoundItems = [];
  currentIndex = 0;
  if (workingMenu.length > 0) {
    card.style.display = "block";
    showItem();
  } else {
    card.style.display = "none";
    alert("All items eliminated or ordered! Click Cart when ready.");
  }
}

// Display the current item
function showItem() {
  if (workingMenu.length === 0) {
    card.style.display = "none";
    alert("All items eliminated or ordered! Click Cart when ready.");
    return;
  }

  if (currentIndex >= workingMenu.length) {
    if (nextRoundItems.length > 0) {
      startNewRound(nextRoundItems);
    } else {
      card.style.display = "none";
      alert("All remaining items eliminated or ordered! Click Cart when ready.");
    }
    return;
  }

  const item = workingMenu[currentIndex];
  document.getElementById("itemName").textContent = item.name;
  document.getElementById("itemDesc").textContent = item.description;
  document.getElementById("itemPrice").textContent = item.price;
  document.getElementById("itemImage").src = item.image;

  card.style.transform = "translate(0,0)";
  card.style.opacity = "1";
  card.classList.remove("swipe-left", "swipe-right", "swipe-up");
}

// Helper to convert price
function priceToNumber(price) {
  return Number(price.replace("$",""));
}

// Update cart button
function updateCartDisplay() {
  orderCount.textContent = "Ordered: " + ordered.length;
  let total = ordered.reduce((sum, item) => sum + priceToNumber(item.price), 0);
  cartButton.textContent = `Cart (${ordered.length} – $${total})`;
}

// Pointer variables
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

  // Show visual hint
  card.classList.remove("swipe-left", "swipe-right", "swipe-up");
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (dy < -60 && absY > absX) {
    card.classList.add("swipe-up");
  } else if (dx > 80 && absX > absY) {
    card.classList.add("swipe-right");
  } else if (dx < -80 && absX > absY) {
    card.classList.add("swipe-left");
  }
});

card.addEventListener("pointerup", e => {
  card.classList.remove("swipe-left", "swipe-right", "swipe-up");

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  const item = workingMenu[currentIndex];
  let swipeType = null;

  if (dy < -60 && absY > absX) {
    // Swipe up → order
    ordered.push(item);
    swipeType = "up";
    updateCartDisplay();
    swipeAway(0, -600);
    historyStack.push({ item, type: swipeType, index: currentIndex });
    workingMenu.splice(currentIndex, 1);
  } 
  else if (dx > 80 && absX > absY) {
    // Swipe right → keep for next round
    swipeType = "right";
    nextRoundItems.push(item);
    historyStack.push({ item, type: swipeType, index: currentIndex });
    currentIndex++;
  } 
  else if (dx < -80 && absX > absY) {
    // Swipe left → eliminate
    swipeType = "left";
    historyStack.push({ item, type: swipeType, index: currentIndex });
    workingMenu.splice(currentIndex, 1);
  } 
  else {
    card.style.transform = "translate(0,0)";
    startX = 0;
    startY = 0;
    return;
  }

  startX = 0;
  startY = 0;
  showItem();
});

function swipeAway(x, y) {
  card.style.transform = `translate(${x}px, ${y}px)`;
  card.style.opacity = "0";
}

// Undo button
undoBtn.onclick = () => {
  if (historyStack.length === 0) return;

  const last = historyStack.pop();
  const item = last.item;

  if (last.type === "up") {
    ordered.splice(ordered.indexOf(item), 1);
    workingMenu.splice(last.index, 0, item);
  } else if (last.type === "left") {
    workingMenu.splice(last.index, 0, item);
  } else if (last.type === "right") {
    nextRoundItems.splice(nextRoundItems.indexOf(item), 1);
  }

  showItem();
  updateCartDisplay();
};

// Cart button
cartButton.onclick = () => {
  let total = ordered.reduce((sum, item) => sum + priceToNumber(item.price), 0);

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

  appDiv.innerHTML = html;
};
