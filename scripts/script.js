const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay  = document.querySelector(".word-display");
const guessesText  = document.querySelector(".guesses-text b");
const keyboardDiv  = document.querySelector(".keyboard");
const gameModal    = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const timerText    = document.querySelector(".timer-text b");

const maxGuesses = 6;
const roundTimeSeconds = 120; // total seconds per round


let currentWord = "";
let wrongGuessCount = 0;
let timer = null;
let timeLeft = roundTimeSeconds;
let level = 1;


function startTimer() {
  stopTimer();
  timeLeft = roundTimeSeconds;
  updateTimerUI();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      stopTimer();
      gameOver(false);
    }
  }, 1000);
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function updateTimerUI() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  timerText.innerText = `${m}:${s}`;
}


function resetGame() {
  // reset board for the SAME currentWord
  stopTimer();
  wrongGuessCount = 0;

  
  hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
  keyboardDiv.querySelectorAll("button").forEach(btn => (btn.disabled = false));
  wordDisplay.innerHTML = currentWord.split("")
    .map(() => '<li class="letter"></li>')
    .join("");


  gameModal.classList.remove("show");
  startTimer();
}

function getRandomWord() {
  // Simple: pick from whole list (no difficulty filters to keep it clean)
  const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
  currentWord = word.toLowerCase();
  document.querySelector(".hint-text b").innerText = hint;
}

function newLevel() {
  level++;          
  getRandomWord();   
  resetGame();       
}

function gameOver(isVictory) {

  stopTimer();

  
  const modalText = isVictory ? "You found the word:" : "The correct word was:";
  gameModal.querySelector("img").src = `images/${isVictory ? "victory" : "lost"}.gif`;
  gameModal.querySelector("h4").innerText = isVictory ? "Congrats!" : "Game Over!";
  gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;

  
  keyboardDiv.querySelectorAll("button").forEach(btn => (btn.disabled = true));

  
  if (isVictory) {
    playAgainBtn.innerText = "Next Level";
    playAgainBtn.onclick = () => {
      newLevel(); 
    };
  } else {
    playAgainBtn.innerText = "Play Again";
    playAgainBtn.onclick = () => {
      resetGame(); 
    };
  }

  
  gameModal.classList.add("show");
}


function initGame(button, clickedLetter) {
  if (!currentWord || !button) return;

  
  if (!currentWord.includes(clickedLetter)) {
    wrongGuessCount++;
    hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
  } else {
    // reveal ALL positions of that letter
    [...currentWord].forEach((letter, idx) => {
      if (letter === clickedLetter) {
        const slot = wordDisplay.querySelectorAll("li")[idx];
        if (slot && !slot.classList.contains("guessed")) {
          slot.innerText = letter;
          slot.classList.add("guessed");
        }
      }
    });
  }


  button.disabled = true;

  
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

  
  const solved = [...wordDisplay.querySelectorAll("li")]
    .every(li => li.classList.contains("guessed"));
  if (solved) return gameOver(true);
  if (wrongGuessCount >= maxGuesses) return gameOver(false);
}

function renderKeyboard() {
  keyboardDiv.innerHTML = ""; // in case of hot reload
  for (let code = 97; code <= 122; code++) {
    const letter = String.fromCharCode(code);
    const btn = document.createElement("button");
    btn.innerText = letter;
    btn.addEventListener("click", (e) => initGame(btn, letter));
    keyboardDiv.appendChild(btn);
  }
}

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k.length === 1 && k >= "a" && k <= "z" && !gameModal.classList.contains("show")) {
    const btn = [...keyboardDiv.querySelectorAll("button")].find(b => b.innerText === k);
    if (btn && !btn.disabled) initGame(btn, k);
  }
});


renderKeyboard();
getRandomWord();
resetGame();
