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

// --- New State Variables for Features ---
let level = 1;
let levels = [
  { name: "Rainforest", bg: "rainforest.png", dropSpeed: 3.5, dropInterval: 1000, time: 30 },
  { name: "Village", bg: "village.png", dropSpeed: 2.8, dropInterval: 850, time: 30 },
  { name: "Arid Zone", bg: "arid.jpg", dropSpeed: 2.2, dropInterval: 700, time: 30 }
];
let pollutedCaught = 0;
let cleanCaught = 0;
let bonusCaught = 0;
let shield = false;
let doublePoints = false;
let doublePointsTimeout = null;
let freezeTimeout = null;
let stormActive = false;
let stormTimeout = null;
let bonusRound = false;
let bonusRoundTimeout = null;
let playerName = localStorage.getItem('playerName') || '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

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
  leaderboardList.innerHTML =
    `<li>Your High Score: <strong>${highScore}</strong></li>` +
    leaderboard.map(e => `<li>${e.name}: <strong>${e.score}</strong></li>`).join('');
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
  setLevel(level);
  gameRunning = true;
  score = 0;
  streak = 0;
  timeLeft = 60;
  dropSpeed = 3.5;
  dropInterval = 1000;
  scoreSpan.textContent = score;
  timeSpan.textContent = timeLeft;
  document.getElementById('progress-inner').style.width = "100%";
  clearDrops();
  removeEndMessage();
  addCup();

  // Start drop creation and timer
  dropMaker = setInterval(() => {
    createDrop();
    // Difficulty scaling: increase speed, decrease interval
    if (dropSpeed > 1.2) dropSpeed -= 0.02;
    if (dropInterval > 400) dropInterval -= 2;
    // Storm event
    if (Math.random() < 0.01) triggerStorm();
    // Bonus round every 50 points
    if (score > 0 && score % 50 === 0 && !bonusRound) triggerBonusRound();
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

// --- Progress Bar ---
const progressBar = document.createElement("div");
progressBar.id = "progress-bar";
progressBar.style.height = "8px";
progressBar.style.width = "100%";
progressBar.style.background = "linear-gradient(90deg,#2E9DF7,#FFC907)";
progressBar.style.borderRadius = "6px";
progressBar.style.marginBottom = "8px";
progressBar.style.overflow = "hidden";
progressBar.innerHTML = `<div id="progress-inner" style="height:100%;width:100%;background:#2E9DF7;transition:width 1s;"></div>`;
document.querySelector('.score-panel').before(progressBar);

// --- Animate Start Button ---
startBtn.classList.add("pulse-anim");

// --- How to Play Modal ---
function showHowToPlay() {
  // Simple modal for tutorial
  alert("How to Play:\n\nCatch blue drops for points.\nCatch green drops for power-ups!\nAvoid brown drops (polluted water).\nSurvive each level and aim for a high score!");
}

// --- Level Progression ---
function setLevel(lvl) {
  level = lvl;
  let l = levels[level-1] || levels[levels.length-1];
  dropSpeed = l.dropSpeed;
  dropInterval = l.dropInterval;
  timeLeft = l.time;
  // Remove previous level class
  gameContainer.classList.remove('level-1', 'level-2', 'level-3');
  // Add current level class for background
  gameContainer.classList.add(`level-${level}`);
  document.body.style.background = `linear-gradient(120deg,#e0f7fa,#fffbe6 80%)`;
}

// --- Power-ups ---
function activateBonus(type) {
  if (type === "freeze") {
    clearInterval(timerInterval);
    freezeTimeout = setTimeout(() => { timerInterval = setInterval(updateTimer, 1000); }, 3000);
    showScoreFeedback("Time Frozen!", cup, "#3ec300");
  } else if (type === "double") {
    doublePoints = true;
    if (doublePointsTimeout) clearTimeout(doublePointsTimeout);
    doublePointsTimeout = setTimeout(() => { doublePoints = false; }, 10000);
    showScoreFeedback("Double Points!", cup, "#3ec300");
  } else if (type === "shield") {
    shield = true;
    showScoreFeedback("Shield!", cup, "#3ec300");
  }
}

// --- Storm Event ---
function triggerStorm() {
  if (stormActive) return;
  stormActive = true;
  dropInterval = Math.max(300, dropInterval / 2);
  document.getElementById('game-container').classList.add('storm');
  stormTimeout = setTimeout(() => {
    stormActive = false;
    dropInterval = levels[level-1]?.dropInterval || 1000;
    document.getElementById('game-container').classList.remove('storm');
  }, 10000);
}

// --- Bonus Round ---
function triggerBonusRound() {
  bonusRound = true;
  showScoreFeedback("BONUS ROUND!", cup, "#FFC907");
  bonusRoundTimeout = setTimeout(() => { bonusRound = false; }, 10000);
}

// --- Create Drop (clean, polluted, bonus) ---
function createDrop() {
  let rand = Math.random();
  let dropType = "clean";
  if (rand > 0.95) dropType = "bonus";
  else if (rand > 0.7) dropType = "polluted";

  const drop = document.createElement("div");
  drop.className = "water-drop " + dropType;
  drop.style.width = drop.style.height = "30px";
  drop.style.left = Math.random() * (gameContainer.offsetWidth - 30) + "px";
  drop.style.top = "0px";
  drop.style.position = "absolute";
  drop.style.transition = `top ${dropSpeed}s linear`;

  // SVG color based on type
  if (dropType === "bonus") {
    drop.innerHTML = `<svg width="30" height="30"><path d="M15 2 C15 2, 4 18, 4 24 C4 30, 26 30, 26 24 C26 18, 15 2, 15 2 Z" fill="#3ec300" stroke="#fff"/></svg>`;
  } else if (dropType === "polluted") {
    drop.innerHTML = `<svg width="30" height="30"><path d="M15 2 C15 2, 4 18, 4 24 C4 30, 26 30, 26 24 C26 18, 15 2, 15 2 Z" fill="#8d6748" stroke="#fff"/></svg>`;
  } else {
    drop.innerHTML = `<svg width="30" height="30"><path d="M15 2 C15 2, 4 18, 4 24 C4 30, 26 30, 26 24 C26 18, 15 2, 15 2 Z" fill="#2E9DF7" stroke="#fff"/></svg>`;
  }

  gameContainer.appendChild(drop);

  requestAnimationFrame(() => {
    drop.style.top = (gameContainer.offsetHeight - 30) + "px";
  });

  function checkCatch() {
    if (!gameRunning) return;
    if (isCaught(drop)) {
      drop.classList.add("bounce");
      if (dropType === "clean") {
        let pts = bonusRound ? 3 : doublePoints ? 2 : 1;
        score += pts;
        cleanCaught++;
        scoreSpan.textContent = score;
        playSound('collect');
        showScoreFeedback(`+${pts}`, drop, "#2E9DF7");
      } else if (dropType === "polluted") {
        if (shield) {
          shield = false;
          showScoreFeedback("Shielded!", drop, "#FFC907");
        } else {
          score = Math.max(0, score - 1);
          pollutedCaught++;
          scoreSpan.textContent = score;
          playSound('wrong');
          showScoreFeedback("-1", drop, "#8d6748");
        }
      } else if (dropType === "bonus") {
        bonusCaught++;
        let effect = Math.random();
        if (effect < 0.33) activateBonus("freeze");
        else if (effect < 0.66) activateBonus("double");
        else activateBonus("shield");
        playSound('collect');
        showScoreFeedback("BONUS!", drop, "#3ec300");
      }
      drop.remove();
      return;
    }
    if (drop.parentNode) requestAnimationFrame(checkCatch);
  }
  requestAnimationFrame(checkCatch);

  setTimeout(() => { if (drop.parentNode) drop.remove(); }, dropSpeed * 1000);
}

// --- Timer Logic with Progress Bar ---
function updateTimer() {
  timeLeft--;
  timeSpan.textContent = timeLeft;
  document.getElementById('progress-inner').style.width = `${(timeLeft / (levels[level-1]?.time || 30)) * 100}%`;
  if (timeLeft <= 0) {
    endLevel();
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

// --- End Level and Stats Modal ---
function endLevel() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  clearDrops();
  playSound('gameover');
  showLevelStats();
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

// --- Show Level Stats Modal ---
function showLevelStats() {
  removeEndMessage();
  const msgDiv = document.createElement("div");
  msgDiv.id = "end-message";
  msgDiv.innerHTML = `
    <div>Level: <b>${levels[level-1]?.name || "Endless"}</b></div>
    <div>You collected <b>${cleanCaught}</b> clean, <b>${bonusCaught}</b> bonus, <b>${pollutedCaught}</b> polluted drops.</div>
    <div>Score: <b>${score}</b></div>
    <div style="font-size:0.95rem;color:#888;">${waterFacts[Math.floor(Math.random() * waterFacts.length)]}</div>
    <button class="btn btn-warning mt-3" onclick="nextLevel()">Next Level</button>
    <button class="btn btn-secondary mt-3" onclick="showWelcome()">Main Menu</button>
    <button class="btn btn-info mt-3" onclick="showDonate()">Support Clean Water</button>
    <button class="btn btn-success mt-3" onclick="showLeaderboard()">Leaderboard</button>
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
    let name = playerName || prompt("New High Score! Enter your name:");
    if (name) {
      playerName = name;
      localStorage.setItem('playerName', name);
      leaderboard.push({ name, score });
      leaderboard = leaderboard.sort((a,b) => b.score - a.score).slice(0,5);
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
  }
}

// --- Show Leaderboard Modal ---
function showLeaderboard() {
  leaderboardModal.classList.add('show');
  leaderboardModal.style.display = 'block';
  leaderboardList.innerHTML =
    `<li>Your High Score: <strong>${highScore}</strong></li>` +
    leaderboard.map(e => `<li>${e.name}: <strong>${e.score}</strong></li>`).join('');
}

// --- Animate Start Button CSS ---
const style = document.createElement('style');
style.innerHTML = `
.pulse-anim {
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 #FFC90788; }
  70% { box-shadow: 0 0 0 12px #FFC90700; }
  100% { box-shadow: 0 0 0 0 #FFC90700; }
}
.storm { filter: brightness(0.7) saturate(1.2); }
`;
document.head.appendChild(style);

// --- On Load: Show How To Play Modal ---
window.onload = function() {
  showHowToPlay();
  showWelcome();
};

function nextLevel() {
  removeEndMessage();
  // Advance to next level or loop to last if out of bounds
  level++;
  if (level > levels.length) level = levels.length;
  // Reset per-level stats
  cleanCaught = 0;
  pollutedCaught = 0;
  bonusCaught = 0;
  shield = false;
  doublePoints = false;
  bonusRound = false;
  // Set up new level and start
  setLevel(level);
  startGame();
}

// Make nextLevel globally accessible for inline onclick
window.nextLevel = nextLevel;

// --- Donate Button ---
function showDonate() {
  window.open("https://www.charitywater.org/?_gl=1*1tslryf*_up*MQ..&gclid=Cj0KCQjwu7TCBhCYARIsAM_S3Ng5pyws6fp6r4yQh5lGoya8HDsNb0glaDsV0TI55EpvaF5pvGUobtcaAtSlEALw_wcB&gbraid=0AAAAA98QX68Jb1OoekL2Lz_hrmO5UBesz", "_blank");
}
