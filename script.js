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

// --- Modal Elements ---
const welcomeModal = document.getElementById('welcome-modal');
const welcomeStartBtn = document.getElementById('welcome-start-btn');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardList = document.getElementById('leaderboard-list');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');
const learnMoreModal = document.getElementById('learnmore-modal');
const closeLearnMoreBtn = document.getElementById('close-learnmore-btn');

// --- Game State Variables ---
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 60;
let highScore = Number(localStorage.getItem('highScore') || 0);
let streak = 0;
let dropSpeed = 3.5; // seconds for drop to fall
let dropInterval = 1000; // ms between drops

// --- DOM Elements ---
const scoreSpan = document.getElementById("score");
const timeSpan = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");

// --- Educational Facts ---
const waterFacts = [
  "771 million people lack access to clean water.",
  "Every 2 minutes a child dies from a water-related disease.",
  "Access to clean water can improve education and health.",
  "Women and girls spend 200 million hours daily collecting water."
];

// --- Sound Effects ---
const sounds = {
  collect: new Audio('collect.mp3'),
  wrong: new Audio('wrong.mp3'),
  gameover: new Audio('gameover.mp3')
};

// --- Show Welcome Modal ---
function showWelcome() {
  welcomeModal.classList.add('show');
  welcomeModal.style.display = 'block';
}
function hideWelcome() {
  welcomeModal.classList.remove('show');
  welcomeModal.style.display = 'none';
}
welcomeStartBtn.onclick = () => {
  hideWelcome();
  startGame();
};
learnMoreBtn.onclick = () => {
  learnMoreModal.classList.add('show');
  learnMoreModal.style.display = 'block';
};
closeLearnMoreBtn.onclick = () => {
  learnMoreModal.classList.remove('show');
  learnMoreModal.style.display = 'none';
};

// --- Leaderboard Modal ---
function showLeaderboard() {
  leaderboardModal.classList.add('show');
  leaderboardModal.style.display = 'block';
  leaderboardList.innerHTML = `<li>High Score: <strong>${highScore}</strong></li>`;
}
if (closeLeaderboardBtn) {
  closeLeaderboardBtn.onclick = () => {
    leaderboardModal.classList.remove('show');
    leaderboardModal.style.display = 'none';
  };
}

// --- Start Game ---
startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  streak = 0;
  timeLeft = 60;
  dropSpeed = 3.5;
  dropInterval = 1000;
  scoreSpan.textContent = score;
  timeSpan.textContent = timeLeft;
  clearDrops();
  removeEndMessage();
  addCup();

  // Start drop creation and timer
  dropMaker = setInterval(() => {
    createDrop();
    // Difficulty scaling: increase speed, decrease interval
    if (dropSpeed > 1.2) dropSpeed -= 0.02;
    if (dropInterval > 400) dropInterval -= 2;
    clearInterval(dropMaker);
    dropMaker = setInterval(() => createDrop(), dropInterval);
  }, dropInterval);

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

// --- Create Drop (clean or polluted) ---
function createDrop() {
  // 70% clean, 30% polluted
  const isClean = Math.random() > 0.3;
  const drop = document.createElement("div");
  drop.className = "water-drop " + (isClean ? "clean" : "polluted");
  drop.style.width = drop.style.height = "30px";
  drop.style.left = Math.random() * (gameContainer.offsetWidth - 30) + "px";
  drop.style.top = "0px";
  drop.style.position = "absolute";
  drop.style.transition = `top ${dropSpeed}s linear`;

  // SVG: let CSS control color
  drop.innerHTML = `
    <svg width="30" height="30" viewBox="0 0 30 30">
      <path d="M15 2 C15 2, 4 18, 4 24 C4 30, 26 30, 26 24 C26 18, 15 2, 15 2 Z" />
    </svg>
  `;

  gameContainer.appendChild(drop);

  // Animate drop falling (use requestAnimationFrame for reliability)
  requestAnimationFrame(() => {
    drop.style.top = (gameContainer.offsetHeight - 30) + "px";
  });

  // Animate and check for catch
  function checkCatch() {
    if (!gameRunning) return;
    if (isCaught(drop)) {
      drop.classList.add("bounce");
      if (isClean) {
        score++;
        streak++;
        scoreSpan.textContent = score;
        playSound('collect');
        showScoreFeedback("+1", drop, "#2E9DF7");
      } else {
        score = Math.max(0, score - 1);
        streak = 0;
        scoreSpan.textContent = score;
        playSound('wrong');
        showScoreFeedback("-1", drop, "#8d6748");
      }
      drop.remove();
      return;
    }
    if (drop.parentNode) requestAnimationFrame(checkCatch);
  }
  requestAnimationFrame(checkCatch);

  // Remove drop if it reaches bottom
  setTimeout(() => {
    if (drop.parentNode) drop.remove();
  }, dropSpeed * 1000);
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
  playSound('gameover');
  showEndMessage();
  updateHighScore();
}

// --- Show End Message with Fact ---
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
  msgDiv.style.fontSize = "1.2rem";
  msgDiv.style.fontWeight = "bold";
  msgDiv.style.textAlign = "center";
  msgDiv.style.zIndex = "10";
  msgDiv.style.color = "#2E9DF7";
  msgDiv.style.maxWidth = "90vw";
  msgDiv.style.wordBreak = "break-word";

  // Motivational message and fact
  const fact = waterFacts[Math.floor(Math.random() * waterFacts.length)];
  msgDiv.innerHTML = `
    <div>You collected <b>${score}</b> drops!</div>
    <div style="font-size:1rem;margin:10px 0;">${score >= 20 ? "That's enough for clean water for one person for a day!" : "Keep trying for a new high score!"}</div>
    <div style="font-size:0.95rem;color:#888;">${fact}</div>
    <button class="btn btn-warning mt-3" onclick="showLeaderboard()">View Leaderboard</button>
    <button class="btn btn-secondary mt-3" onclick="showWelcome()">Play Again</button>
  `;
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

// --- Score Feedback Animation ---
function showScoreFeedback(text, element, color) {
  const feedback = document.createElement("div");
  feedback.textContent = text;
  feedback.style.position = "absolute";
  feedback.style.left = element.style.left;
  feedback.style.top = element.style.top || "0px";
  feedback.style.transform = "translateY(-30px)";
  feedback.style.fontWeight = "bold";
  feedback.style.fontSize = "1.2rem";
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

// --- Sound Helper ---
function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
}

// --- High Score / Leaderboard ---
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
}

// --- Show Welcome on Load ---
window.onload = showWelcome;
