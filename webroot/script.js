const app = (() => {
  let boardSize = 4;
  let board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(false)
  );
  let queensPlaced = [];
  let mistakes = 0;
  let maxMistakes = 3;
  let gameRound = 1;
  let gameStatus = "playing";

  const calculateMaxMistakes = () => {
    switch (boardSize) {
      case 6:
        return 4;
      case 8:
        return 5;
      case 10:
        return 5;
      default:
        return 3;
    }
  };

  const updateUI = () => {
    document.getElementById("round-info").textContent = `Round: ${gameRound}`;
    document.getElementById(
      "board-info"
    ).textContent = `Board: ${boardSize}x${boardSize}`;
    document.getElementById(
      "mistakes-info"
    ).textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
    renderBoard();
  };

  const validateQueenPlacement = (x, y) => {
    return queensPlaced.filter(
      (queen) =>
        queen.x === x ||
        queen.y === y ||
        Math.abs(queen.x - x) === Math.abs(queen.y - y)
    );
  };

  const highlightAttackPaths = (attackingQueen, newQueen) => {
    const boardElement = document.getElementById("board");
    const cells = boardElement.children;

    document.querySelectorAll(".attack-line").forEach((line) => line.remove());
    cells.forEach((cell) => {
      cell.classList.remove("attack-path");
      cell.classList.remove("attacking-queen");
    });

    const queenIndex = attackingQueen.x * boardSize + attackingQueen.y;
    const attackedIndex = newQueen.x * boardSize + newQueen.y;

    const queenCell = cells[queenIndex];
    const attackedCell = cells[attackedIndex];

    queenCell.classList.add("attacking-queen");
    attackedCell.classList.add("attacking-queen");

    if (attackingQueen.x === newQueen.x) {
      for (let y = 0; y < boardSize; y++) {
        const index = attackingQueen.x * boardSize + y;
        cells[index].classList.add("attack-path");
      }
    } else if (attackingQueen.y === newQueen.y) {
      for (let x = 0; x < boardSize; x++) {
        const index = x * boardSize + attackingQueen.y;
        cells[index].classList.add("attack-path");
      }
    } else {
      for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
          if (
            Math.abs(x - attackingQueen.x) === Math.abs(y - attackingQueen.y)
          ) {
            const index = x * boardSize + y;
            cells[index].classList.add("attack-path");
          }
        }
      }
    }

    const line = document.createElement("div");
    line.classList.add("attack-line");
    line.style.position = "absolute";
    line.style.backgroundColor = "red";
    line.style.height = "2px";

    const queenRect = queenCell.getBoundingClientRect();
    const attackedRect = attackedCell.getBoundingClientRect();

    const startX = queenRect.left + queenRect.width / 2;
    const startY = queenRect.top + queenRect.height / 2;
    const endX = attackedRect.left + attackedRect.width / 2;
    const endY = attackedRect.top + attackedRect.height / 2;

    const length = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = "0 0";
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.zIndex = "10";

    document.body.appendChild(line);
  };

  const placeQueen = (x, y) => {
    if (gameStatus !== "playing") return; // Prevent further actions if the game is not in 'playing' state

    // Early return if already at maximum mistakes
    if (mistakes >= maxMistakes) {
      showError("Game Over! You've made too many mistakes.");
      gameStatus = "lost";
      showControls();
      return;
    }

    if (board[x][y]) {
      board[x][y] = false;
      queensPlaced = queensPlaced.filter(
        (queen) => queen.x !== x || queen.y !== y
      );
      updateUI();
      return;
    }

    const attackingQueens = validateQueenPlacement(x, y);

    if (attackingQueens.length > 0) {
      // Only increment mistakes if already placed in a non-attacking position
      if (!board[x][y]) {
        mistakes++;
      }

      // Immediately check if mistakes exceed limit
      if (mistakes >= maxMistakes) {
        gameStatus = "lost";
        showError("Game Over! You've made too many mistakes.");
        showControls();
        return;
      }

      // Update UI immediately after a mistake
      updateUI();

      showError("Invalid Queen Placement!");
      highlightAttackPaths(attackingQueens[0], { x, y });

      return; // Exit the function after handling mistakes
    }

    board[x][y] = true;
    queensPlaced.push({ x, y });

    hideError();

    if (queensPlaced.length === boardSize) {
      handleRoundWin();
    }

    updateUI();
  };

  const handleRoundWin = () => {
    gameStatus = "round-complete";
    showError("Round Complete! Click 'Next Round' to continue.");
    showControls();
    document.getElementById("next-round").classList.remove("hidden");
  };

  const resetGame = () => {
    boardSize = 4;
    board = Array.from({ length: 4 }, () => Array(4).fill(false));
    queensPlaced = [];
    mistakes = 0;
    maxMistakes = 3;
    gameRound = 1;
    gameStatus = "playing";
    hideError();
    showControls();
    document.getElementById("restart-game").classList.remove("hidden");
    updateUI();
  };

  const proceedToNextRound = () => {
    if (gameRound < 4) {
      gameRound++;
      boardSize += 2;
      board = Array.from({ length: boardSize }, () =>
        Array(boardSize).fill(false)
      );
      queensPlaced = [];
      maxMistakes = calculateMaxMistakes();
      mistakes = 0;
      gameStatus = "playing";
      hideError();
      showControls();
      document.getElementById("restart-game").classList.remove("hidden");
    } else {
      gameStatus = "won";
      showError("Congratulations! You've won the game!");
    }
    updateUI();
  };

  const showError = (message) => {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  };

  const hideError = () => {
    document.getElementById("error-message").classList.add("hidden");
  };

  const showControls = () => {
    document.getElementById("game-controls").classList.remove("hidden");
    document
      .getElementById("next-round")
      .classList.toggle("hidden", gameStatus !== "round-complete");
    document.getElementById("restart-game").classList.remove("hidden");
  };

  const hideControls = () => {
    document.getElementById("game-controls").classList.add("hidden");
  };

  const renderBoard = () => {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;

        if (board[x][y]) {
          cell.textContent = "♕";
        }

        if (gameStatus === "playing") {
          cell.addEventListener("click", () => placeQueen(x, y));
        } else {
          cell.style.pointerEvents = "none"; // Disable clicks if game is over
        }

        boardElement.appendChild(cell);
      }
    }
  };

  document.getElementById("restart-game").addEventListener("click", resetGame);
  document
    .getElementById("next-round")
    .addEventListener("click", proceedToNextRound);

  return { init: updateUI };
})();

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  app.init();
  document.getElementById("restart-game").classList.remove("hidden");
  document.getElementById("game-controls").classList.remove("hidden");
});
