const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const levelText = document.querySelector(".level-text b"); // Add this in HTML

const maxGuesses = 6;
let currentWord, correctLetters, wrongGuessCount;
let level = 1;

const resetGame = () => {
  correctLetters = [];
  wrongGuessCount = 0;
  hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
  keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
  wordDisplay.innerHTML = currentWord.split("").map(() => '<li class="letter"></li>').join("");
  gameModal.classList.remove("show");
  playAgainBtn.style.display = "inline-block"; // Always visible now
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
  levelText.innerText = level; // update level display
  resetGame();
};

const gameOver = (isVictory) => {
  const modalText = isVictory ? 'You found the word:' : 'The correct word was:';
  gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
  gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
  gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
  gameModal.classList.add("show");

  if (isVictory) {
    playAgainBtn.innerText = "Next Level";
    playAgainBtn.onclick = () => {
      level++;
      getRandomWord();
    };
  } else {
    playAgainBtn.innerText = "Play Again";
    playAgainBtn.onclick = () => resetGame(); // retry same word
  }
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
