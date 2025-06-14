// --- Branding: charity: water logo URL (replace with your provided logo if needed) ---
const logoUrl = "https://www.charitywater.org/assets/images/logos/charity-water-logo.svg";

// --- Winning & Losing Messages ---
const winMessages = [
  "Amazing! You’re a water hero! 💧",
  "You did it! Clean water for all! 🌍",
  "You win!Every drop counts!",
  "Winner! You made a splash for good!"
];
const loseMessages = [
  "Try again! Every drop matters.",
  "Keep going! You can do it!",
  "Almost there! Give it another shot.",
  "Don't give up! Water is life."
];

// --- Game State Variables ---
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;

// --- DOM Elements ---
const scoreSpan = document.getElementById("score");
const timeSpan = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");

// --- Start Game ---
startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreSpan.textContent = score;
  timeSpan.textContent = timeLeft;
  clearDrops();
  removeEndMessage();
  addCup();

  // Start drop/can creation and timer
  dropMaker = setInterval(() => {
    // 25% chance to spawn a can, else spawn a drop
    if (Math.random() < 0.25) {
      createCan();
    } else {
      createDrop();
    }
  }, 1000);
  timerInterval = setInterval(updateTimer, 1000);

  startBtn.disabled = true;
  startBtn.textContent = "Game Running...";
}

// --- Add Cup Element ---
let cup;
let cupWidth = 90; // px, matches CSS
let cupHeight = 60;
function addCup() {
  if (cup) cup.remove();
  cup = document.createElement("div");
  cup.id = "cup";
  // SVG: blue bucket
  cup.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Bucket body -->
      <ellipse cx="45" cy="60" rx="32" ry="8" fill="#1B7FC4" stroke="#2E9DF7" stroke-width="3"/>
      <rect x="13" y="20" width="64" height="40" rx="18" fill="#2E9DF7" stroke="#1B7FC4" stroke-width="3"/>
      <ellipse cx="45" cy="20" rx="32" ry="10" fill="#8BD1CB" stroke="#1B7FC4" stroke-width="2"/>
      <!-- Handle -->
      <path d="M20 30 Q45 0 70 30" stroke="#1B7FC4" stroke-width="4" fill="none"/>
      <!-- Shine -->
      <ellipse cx="35" cy="35" rx="7" ry="3" fill="#fff" opacity="0.3"/>
    </svg>
  `;
  gameContainer.appendChild(cup);
  moveCup(gameContainer.offsetWidth / 2);
}

// --- Move Cup with Mouse or Touch ---
function moveCup(x) {
  const min = 0;
  const max = gameContainer.offsetWidth - cup.offsetWidth;
  let left = x - cup.offsetWidth / 2;
  left = Math.max(min, Math.min(max, left));
  cup.style.left = left + "px";
}

gameContainer.addEventListener("mousemove", e => {
  const rect = gameContainer.getBoundingClientRect();
  moveCup(e.clientX - rect.left);
});
gameContainer.addEventListener("touchmove", e => {
  if (e.touches.length > 0) {
    const rect = gameContainer.getBoundingClientRect();
    moveCup(e.touches[0].clientX - rect.left);
  }
});

// --- Collision Detection ---
function isCaught(element) {
  if (!cup) return false;
  const dropRect = element.getBoundingClientRect();
  const cupRect = cup.getBoundingClientRect();
  // Check if bottom of drop/can is inside cup area
  return (
    dropRect.bottom >= cupRect.top &&
    dropRect.left < cupRect.right &&
    dropRect.right > cupRect.left
  );
}

// --- Modify Drop Creation: SVG Raindrop ---
function createDrop() {
  const drop = document.createElement("div");
  drop.className = "water-drop";
  drop.style.background = "none";
  drop.style.border = "none";
  drop.style.boxShadow = "none";
  drop.style.width = drop.style.height = "60px";
  drop.innerHTML = `
    <svg width="60" height="60" viewBox="0 0 60 60">
      <path d="M30 6
        C30 6, 12 32, 12 42
        C12 53, 48 53, 48 42
        C48 32, 30 6, 30 6 Z"
        fill="#2E9DF7" stroke="#fff" stroke-width="3"/>
      <ellipse cx="24" cy="28" rx="4" ry="8" fill="#fff" opacity="0.3"/>
    </svg>
  `;

  // Random horizontal position
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = "4s";
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
  function checkCatch() {
    if (!gameRunning) return;
    if (isCaught(drop)) {
      score++;
      scoreSpan.textContent = score;
      showScoreFeedback("+1", drop, "#2E9DF7");
      splashEffect(drop);
      animateBucketHandle();
      drop.remove();
      return;
    }
    if (drop.parentNode) requestAnimationFrame(checkCatch);
  }
  requestAnimationFrame(checkCatch);
  gameContainer.appendChild(drop);
}

// --- Modify Can Creation: Use Cup Collision ---
function createCan() {
  const can = document.createElement("div");
  can.className = "water-can";
  can.style.width = "50px";
  can.style.height = "65px";

  // Random horizontal position
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 50);
  can.style.left = xPosition + "px";
  can.style.animationDuration = "4s";

  can.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="28" height="38" rx="6" fill="#FFC907" stroke="#131313" stroke-width="2"/>
      <rect x="12" y="4" width="16" height="8" rx="3" fill="#fff" stroke="#131313" stroke-width="2"/>
      <rect x="16" y="0" width="8" height="8" rx="2" fill="#FFC907" stroke="#131313" stroke-width="2"/>
    </svg>
  `;

  can.addEventListener("animationend", () => {
    can.remove();
  });

  function checkCatch() {
    if (!gameRunning) return;
    if (isCaught(can)) {
      score -= 3;
      if (score < 0) score = 0;
      scoreSpan.textContent = score;
      showScoreFeedback("-3", can, "#F5402C");
      flashRed();
      shakeBucket();
      can.remove();
      return;
    }
    if (can.parentNode) requestAnimationFrame(checkCatch);
  }
  requestAnimationFrame(checkCatch);

  gameContainer.appendChild(can);
}

// --- Red Flash Animation ---
function flashRed() {
  gameContainer.classList.add("flash-red");
  setTimeout(() => {
    gameContainer.classList.remove("flash-red");
  }, 400);
}

// --- Splash Animation for Droplets ---
function splashEffect(drop) {
  drop.classList.add("splash-effect");
}

// --- Shake Animation for Bucket ---
function shakeBucket() {
  if (!cup) return;
  cup.classList.add("shake");
  setTimeout(() => {
    cup.classList.remove("shake");
  }, 400);
}

// --- Animate Bucket Handle (creative) ---
function animateBucketHandle() {
  // Animate the handle path in the SVG
  if (!cup) return;
  const svg = cup.querySelector("svg");
  if (!svg) return;
  const handle = svg.querySelector("path");
  if (!handle) return;
  handle.setAttribute("stroke", "#FFC907");
  setTimeout(() => {
    handle.setAttribute("stroke", "#1B7FC4");
  }, 350);
}

// --- Visual Feedback on Score ---
function showScoreFeedback(text, element, color) {
  const feedback = document.createElement("div");
  feedback.textContent = text;
  feedback.style.position = "absolute";
  feedback.style.left = element.style.left;
  feedback.style.top = element.style.top || "0px";
  feedback.style.transform = "translateY(-30px)";
  feedback.style.fontWeight = "bold";
  feedback.style.fontSize = "1.5rem";
  feedback.style.color = color;
  feedback.style.textShadow = "0 2px 8px #fff";
  feedback.style.pointerEvents = "none";
  feedback.style.zIndex = "20";
  feedback.style.transition = "opacity 0.5s, transform 0.5s";
  feedback.style.opacity = "1";
  gameContainer.appendChild(feedback);

  setTimeout(() => {
    feedback.style.opacity = "0";
    feedback.style.transform = "translateY(-60px)";
  }, 100);

  setTimeout(() => {
    feedback.remove();
  }, 600);
}

// --- Timer Logic ---
function updateTimer() {
  timeLeft--;
  timeSpan.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

// --- End Game ---
function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  clearDrops();

  // Show end message
  showEndMessage();
}

// --- Show End Message ---
function showEndMessage() {
  removeEndMessage();
  const msgDiv = document.createElement("div");
  msgDiv.id = "end-message";
  msgDiv.style.position = "absolute";
  msgDiv.style.top = "50%";
  msgDiv.style.left = "50%";
  msgDiv.style.transform = "translate(-50%, -50%)";
  msgDiv.style.background = "#fff";
  msgDiv.style.border = "3px solid #FFC907";
  msgDiv.style.borderRadius = "16px";
  msgDiv.style.padding = "40px 30px";
  msgDiv.style.boxShadow = "0 8px 32px rgba(46,157,247,0.18)";
  msgDiv.style.fontSize = "2rem";
  msgDiv.style.fontWeight = "bold";
  msgDiv.style.textAlign = "center";
  msgDiv.style.zIndex = "10";
  msgDiv.style.color = "#2E9DF7";
  msgDiv.style.maxWidth = "90vw";
  msgDiv.style.wordBreak = "break-word";

  let msg;
  if (score >= 9) {
    msg = winMessages[Math.floor(Math.random() * winMessages.length)];
    msgDiv.style.borderColor = "#FFC907";
    msgDiv.style.color = "#159A48";
  } else {
    msg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    msgDiv.style.borderColor = "#F5402C";
    msgDiv.style.color = "#F5402C";
  }
  msgDiv.innerHTML = `<div>${msg}</div><div style="font-size:1.2rem;margin-top:12px;">Final Score: ${score}</div>`;
  gameContainer.appendChild(msgDiv);
}

// --- Remove End Message ---
function removeEndMessage() {
  const msgDiv = document.getElementById("end-message");
  if (msgDiv) msgDiv.remove();
}

// --- Clear All Drops ---
function clearDrops() {
  gameContainer.querySelectorAll(".water-drop, .water-can").forEach(el => el.remove());
  if (cup) cup.remove();
}
