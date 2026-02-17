let menu = [];             // full menu from JSON
let workingMenu = [];      // items left in current round
let currentIndex = 0;
let ordered = [];
let historyStack = [];

const card = document.getElementById("card");
const orderCount = document.getElementById("orderCount");
const cartButton = document.getElementById("cartButton");
const undoBtn = document.getElementById("undoBtn");

// Load menu
fetch("./menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    startNewRound(menu.slice()); // start with full menu
  });

// Start a new round with given items
function startNewRound(items) {
  workingMenu = items;
  currentIndex = 0;
  showItem();
}

// Display current item
function showItem() {
  if (workingMenu.length === 0) {
    card.style.display = "none";
    alert("No more items left! Click the cart when ready to check out.");
    return;
  }

  if (currentIndex >= workingMenu.length) {
    // End of round: start next round with items that were swiped right
    const nextRound = workingMenu.filter(item => item.keepForNextRound);
    if (nextRound.length > 0) {
      nextRound.forEach(item => item.keepForNextRound = false); // reset flag
      startNewRound(nextRound);
    } else {
      // Nothing left to repeat
      card.style.display = "none";
      alert("All remaining items eliminated or ordered! Click cart when ready.");
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
}

// Price helper
function priceToNumber(price) {
  return Number(price.replace("$",""));
}

// Update cart button and counter
function updateCartDisplay() {
  orderCount.textContent = "Ordered: " + ordered.length;

  let total = ordered.reduce((sum, item) => sum + priceToNumber(item.price), 0);

  cartButton.textContent = `Cart (${ordered.length} – $${total})`;
}

// Pointer swipe variables
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

  const item = workingMenu[currentIndex];
  let swipeType = null;

  if (dy < -60 && absY > absX) {
    // Swipe up → order
    ordered.push(item);
    swipeType = "up";
    updateCartDisplay();
    swipeAway(0, -600);
    historyStack.push({ item: item, type: swipeType, index: currentIndex });
    workingMenu.splice(currentIndex,1); // remove from current round
  }
  else if (dx > 80 && absX > absY) {
    // Swipe right → keep for next round
    swipeType = "right";
    item.keepForNextRound = true;
    swipeAway(600, 0);
    historyStack.push({ item: item, type: swipeType, index: currentIndex });
    currentIndex++;
  }
  else if (dx < -80 && absX > absY) {
    // Swipe left → eliminate
    swipeType = "left";
    swipeAway(-600, 0);
    historyStack.push({ item: item, type: swipeType, index: currentIndex });
    workingMenu.splice(currentIndex,1); // remove from current round
  }
  else {
    // no swipe, reset
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
    ordered.splice(ordered.indexOf(item),1);
    workingMenu.splice(last.index,0,item);
  } else if (last.type === "left") {
    workingMenu.splice(last.index,0,item);
  } else if (last.type === "right") {
    item.keepForNextRound = false;
  }

  updateCartDisplay();
  showItem();
};

// Cart button
cartButton.onclick = () => {
  const app = document.querySelector(".app");

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

  app.innerHTML = html;
};
