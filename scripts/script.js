const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const timerText = document.querySelector(".timer-text b");

const maxGuesses = 6;
let currentWord, correctLetters, wrongGuessCount, timer, timeLeft;
let level = 1;

const resetGame = () => {
  clearInterval(timer);
  timeLeft = 120; // 2 minutes
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
    playAgainBtn.onclick = () => getRandomWord(); // load new word
  } else {
    playAgainBtn.innerText = "Play Again";
    playAgainBtn.style.display = "inline-block";
    playAgainBtn.onclick = () => resetGame(); // retry same word
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

renderKeyboard();
getRandomWord();
