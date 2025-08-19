const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const timerText = document.querySelector(".timer-text b");
const heartContainer = document.querySelector(".heart-container");

let currentWord, correctLetters, wrongGuessCount, timer, timeLeft;
let maxGuesses = 6;
let level = 1;
let hearts = 5;
const maxHearts = 5;
const heartRegenTime = 10 * 60 * 1000;

const resetGame = () => {
  clearInterval(timer);
  timeLeft = 120;
  updateTimerUI();
  startTimer();

  correctLetters = [];
  wrongGuessCount = 0;
  hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
  keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
  wordDisplay.innerHTML = currentWord.split("").map(() => '<li class="letter"></li>').join("");
  gameModal.classList.remove("show");
};

const getRandomWord = () => {
  const words = wordList.filter(wordObj => {
    if (level <= 3) return wordObj.word.length <= 6;
    if (level <= 6) return wordObj.word.length <= 8;
    return true;
  });
  const { word, hint } = words[Math.floor(Math.random() * words.length)];
  currentWord = word;
  document.querySelector(".hint-text b").innerText = hint;
  resetGame();
};

const gameOver = (isVictory) => {
  clearInterval(timer);
  const modalText = isVictory ? 'You found the word: ' : 'The correct word was:';
  gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
  gameModal.querySelector("h4").innerText = `${isVictory ? 'Congrats!' : 'Game Over!'}`;
  gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
  gameModal.classList.add("show");

  if (isVictory) {
    level++;
    getRandomWord();
  } else {
    hearts--;
    updateHearts();
    if (hearts > 0) {
      setTimeout(getRandomWord, 3000);
    }
  }
};

const updateHearts = () => {
  heartContainer.innerHTML = "";
  for (let i = 0; i < maxHearts; i++) {
    const heart = document.createElement("span");
    heart.innerText = i < hearts ? "❤️" : "🤍";
    heartContainer.appendChild(heart);
  }
};

const regenerateHearts = () => {
  const lastUsed = parseInt(localStorage.getItem("lastHeartUsed")) || 0;
  const now = Date.now();
  const elapsed = now - lastUsed;
  const regenCount = Math.floor(elapsed / heartRegenTime);
  if (regenCount > 0 && hearts < maxHearts) {
    hearts = Math.min(maxHearts, hearts + regenCount);
    localStorage.setItem("lastHeartUsed", now - (elapsed % heartRegenTime));
    updateHearts();
  }
};

const startTimer = () => {
  updateTimerUI();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver(false);
    }
  }, 1000);
};

const updateTimerUI = () => {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  timerText.innerText = `${mins}:${secs}`;
};

const initGame = (button, clickedLetter) => {
  if (!currentWord.includes(clickedLetter)) {
    wrongGuessCount++;
    hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
  } else {
    [...currentWord].forEach((letter, index) => {
      if (letter === clickedLetter) {
        correctLetters.push(letter);
        wordDisplay.querySelectorAll("li")[index].innerText = letter;
        wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
      }
    });
  }

  button.disabled = true;
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

  if (wrongGuessCount === maxGuesses) return gameOver(false);

  const guessedWord = [...wordDisplay.querySelectorAll("li")].every(li => li.classList.contains("guessed"));
  if (guessedWord) return gameOver(true);
};

for (let i = 97; i <= 122; i++) {
  const button = document.createElement("button");
  button.innerText = String.fromCharCode(i);
  keyboardDiv.appendChild(button);
  button.addEventListener("click", e => initGame(e.target, String.fromCharCode(i)));
}

playAgainBtn.addEventListener("click", () => {
  if (hearts > 0) {
    localStorage.setItem("lastHeartUsed", Date.now());
    getRandomWord();
  }
});

setInterval(regenerateHearts, 60000);
regenerateHearts();
getRandomWord();
updateHearts();
