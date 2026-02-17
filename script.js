console.log("App started");

let menu = [];
let currentIndex = 0;
let liked = [];
let ordered = [];

const card = document.getElementById("card");

fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    menu = data;
    showItem();
  });

function showItem() {
  if (currentIndex >= menu.length) {
  showOrderSummary();
  return;
  }

  let item = menu[currentIndex];

  document.getElementById("itemName").textContent = item.name;
  document.getElementById("itemDesc").textContent = item.description;
  document.getElementById("itemPrice").textContent = item.price;
  document.getElementById("itemImage").src = item.image;

  card.style.transform = "translate(0,0)";
  card.style.opacity = "1";
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

  card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.05}deg)`;
});

card.addEventListener("pointerup", e => {
  let deltaX = e.clientX - startX;
  let deltaY = e.clientY - startY;

  if (deltaX > 100) {
    liked.push(menu[currentIndex]);
    swipeAway(500, 0);
  } 
  else if (deltaX < -100) {
    swipeAway(-500, 0);
  } 

else if (deltaY < -100) {
  ordered.push(menu[currentIndex]);
  updateCounter();
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

function showOrderSummary() {
  const app = document.querySelector(".app");

  let html = "<h2>Your Order</h2>";

  if (ordered.length === 0) {
    html += "<p>You didn't order anything.</p>";
  } else {
    ordered.forEach(item => {
      html += `<p>${item.name} - ${item.price}</p>`;
    });
  }

  html += "<br><button onclick='location.reload()'>Start Over</button>";

  app.innerHTML = html;
}
