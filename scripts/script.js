const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const timerText = document.querySelector(".timer-text b");
const heartContainer = document.querySelector(".heart-container");

let currentWord, correctLetters, wrongGuessCount, timer, timeLeft;
const maxGuesses = 6;
let level = 1;
const maxHearts = 5;
const regenTime = 10 * 60 * 1000;

let hearts = JSON.parse(localStorage.getItem("hearts")) || Array(maxHearts).fill(null);

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
  const modalText = isVictory ? 'You found the word:' : 'The correct word was:';
  gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
  gameModal.querySelector("h4").innerText = `${isVictory ? 'Congrats!' : 'Game Over!'}`;
  gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
  gameModal.classList.add("show");

  if (isVictory) {
    level++;
    getRandomWord();
  } else {
    useHeart();
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

const updateHeartsUI = () => {
  heartContainer.innerHTML = "";
  hearts.forEach((usedAt, i) => {
    const span = document.createElement("span");
    if (usedAt === null) {
      span.innerText = "❤️";
    } else {
      const timeLeft = regenTime - (Date.now() - usedAt);
      if (timeLeft > 0) {
        const m = String(Math.floor(timeLeft / 1000 / 60)).padStart(2, "0");
        const s = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, "0");
        span.innerText = `🕓 ${m}:${s}`;
      } else {
        hearts[i] = null;
        span.innerText = "❤️";
        localStorage.setItem("hearts", JSON.stringify(hearts));
      }
    }
    heartContainer.appendChild(span);
  });
};

const regenHeartLoop = () => {
  updateHeartsUI();
  localStorage.setItem("hearts", JSON.stringify(hearts));
};

const useHeart = () => {
  const index = hearts.findIndex(h => h === null);
  if (index !== -1) {
    hearts[index] = Date.now();
    localStorage.setItem("hearts", JSON.stringify(hearts));
    updateHeartsUI();
    setTimeout(getRandomWord, 3000);
  } else {
    playAgainBtn.innerText = "Return to Lobby";
    playAgainBtn.addEventListener("click", () => location.href = "lobby.html");
  }
};

setInterval(regenHeartLoop, 1000);

playAgainBtn.addEventListener("click", () => {
  if (hearts.includes(null)) {
    getRandomWord();
    playAgainBtn.classList.remove("show");
  }
});

renderKeyboard();
updateHeartsUI();
getRandomWord();
