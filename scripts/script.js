const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const timerText = document.querySelector(".timer-text b");
const heartContainer = document.querySelector(".heart-container");

const maxGuesses = 6;
const maxHearts = 5;
const regenTime = 10 * 60 * 1000; // 10 minutes

let currentWord, correctLetters, wrongGuessCount, timer, timeLeft;
let level = 1;
let hearts = JSON.parse(localStorage.getItem("hearts")) || Array(maxHearts).fill(null);

const getNextUsedHeartIndex = () => hearts.findIndex(h => h !== null);

function updateHeartsUI() {
  heartContainer.innerHTML = "";
  let canPlay = false;

  const nextIndex = getNextUsedHeartIndex();

  hearts.forEach((usedAt, i) => {
    const span = document.createElement("span");

    if (usedAt === null) {
      span.textContent = "❤️";
      canPlay = true;
    } else if (i === nextIndex) {
      const timeLeft = regenTime - (Date.now() - usedAt);
      if (timeLeft <= 0) {
        hearts[i] = null;
        span.textContent = "❤️";
        canPlay = true;
        localStorage.setItem("hearts", JSON.stringify(hearts));
      } else {
        const m = String(Math.floor(timeLeft / 1000 / 60)).padStart(2, "0");
        const s = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, "0");
        span.textContent = `${m}:${s}`; // show countdown for NEXT empty heart
      }
    } else {
      span.textContent = "❤️"; // keep others as hearts
    }

    heartContainer.appendChild(span);
  });

  localStorage.setItem("hearts", JSON.stringify(hearts));

  const playButton = document.querySelector(".play-button");
  if (playButton) playButton.style.display = canPlay ? "inline-block" : "none";
}

function loseHeart() {
  const firstAvailableIndex = hearts.findIndex(h => h === null);
  if (firstAvailableIndex === -1) {
    return false; // no hearts left
  }
  hearts[firstAvailableIndex] = Date.now();
  localStorage.setItem("hearts", JSON.stringify(hearts));
  updateHeartsUI();

  // if all hearts are now used
  if (!hearts.includes(null)) {
    return false;
  }
  return true;
}

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
  playAgainBtn.style.display = "none";
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
  const modalText = isVictory ? 'You found the word:' : 'The correct word was:';
  gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
  gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
  gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
  gameModal.classList.add("show");

  if (isVictory) {
    level++;
    playAgainBtn.innerText = "Next Level";
    playAgainBtn.style.display = "inline-block";
    playAgainBtn.onclick = () => getRandomWord(); // load a new word
  } else {
    if (!loseHeart()) {
      playAgainBtn.innerText = "Return to Lobby";
      playAgainBtn.style.display = "inline-block";
      playAgainBtn.onclick = () => location.href = "lobby.html";
    } else {
      playAgainBtn.innerText = "Play Again";
      playAgainBtn.style.display = "inline-block";
      playAgainBtn.onclick = () => {
        resetGame(); // retry SAME word
      };
    }
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

  const guessedAll = [...wordDisplay.querySelectorAll("li")].every(li => li.classList.contains("guessed"));
  if (guessedAll) return gameOver(true);
  if (wrongGuessCount === maxGuesses) return gameOver(false);
};

const renderKeyboard = () => {
  for (let i = 97; i <= 122; i++) {
    const button = document.createElement("button");
    button.innerText = String.fromCharCode(i);
    keyboardDiv.appendChild(button);
    button.addEventListener("click", e => initGame(e.target, String.fromCharCode(i)));
  }
};

setInterval(updateHeartsUI, 1000);

renderKeyboard();
updateHeartsUI();
getRandomWord();
