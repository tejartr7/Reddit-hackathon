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

  const renderBoard = () => {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

    board.forEach((row, x) => {
      row.forEach((cell, y) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.style.backgroundColor =
          (x + y) % 2 === 0 ? "white" : "black";
        cellElement.style.color = (x + y) % 2 === 0 ? "black" : "white";
        cellElement.textContent = cell ? "Q" : "";
        cellElement.addEventListener("click", () => placeQueen(x, y));
        boardElement.appendChild(cellElement);
      });
    });
  };

  const validateQueenPlacement = (x, y) => {
    const attackingQueens = [];
    for (let queen of queensPlaced) {
      if (
        queen.x === x ||
        queen.y === y ||
        Math.abs(queen.x - x) === Math.abs(queen.y - y)
      ) {
        attackingQueens.push(queen);
      }
    }

    if (attackingQueens.length > 0) {
      showError("Invalid Queen Placement!");
      highlightAttackPaths(attackingQueens, { x, y });
      return false;
    }
    hideError();
    return true;
  };

  const highlightAttackPaths = (attackingQueens, newQueen) => {
    const boardElement = document.getElementById("board");
    const cells = boardElement.children;

    // Remove previous attack path highlights
    cells.forEach((cell) => cell.classList.remove("attack-path"));

    // Highlight attacking queens and paths
    attackingQueens.forEach((queen) => {
      const queenIndex = queen.x * boardSize + queen.y;
      cells[queenIndex].classList.add("attack-path");

      // Highlight attack path
      if (queen.x === newQueen.x) {
        // Horizontal attack
        for (let y = 0; y < boardSize; y++) {
          const index = queen.x * boardSize + y;
          cells[index].classList.add("attack-path");
        }
      } else if (queen.y === newQueen.y) {
        // Vertical attack
        for (let x = 0; x < boardSize; x++) {
          const index = x * boardSize + queen.y;
          cells[index].classList.add("attack-path");
        }
      } else {
        // Diagonal attack
        for (let x = 0; x < boardSize; x++) {
          for (let y = 0; y < boardSize; y++) {
            if (Math.abs(x - queen.x) === Math.abs(y - queen.y)) {
              const index = x * boardSize + y;
              cells[index].classList.add("attack-path");
            }
          }
        }
      }
    });

    // Highlight new queen's attack paths
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        if (
          x === newQueen.x ||
          y === newQueen.y ||
          Math.abs(x - newQueen.x) === Math.abs(y - newQueen.y)
        ) {
          const index = x * boardSize + y;
          cells[index].classList.add("attack-path");
        }
      }
    }
  };

  const placeQueen = (x, y) => {
    if (gameStatus !== "playing") return;

    if (board[x][y]) {
      board[x][y] = false;
      queensPlaced = queensPlaced.filter(
        (queen) => queen.x !== x || queen.y !== y
      );
    } else {
      if (!validateQueenPlacement(x, y)) {
        mistakes++;
        if (mistakes >= maxMistakes) {
          gameStatus = "lost";
          showError("Game Over! You've made too many mistakes.");
          showControls();
        }
        updateUI();
        return;
      }
      board[x][y] = true;
      queensPlaced.push({ x, y });

      // Clear error message if placement is valid
      hideError();

      if (queensPlaced.length === boardSize) handleRoundWin();
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
    hideControls();
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
      maxMistakes++;
      gameStatus = "playing";
      hideError();
      hideControls();
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
  };

  const hideControls = () => {
    document.getElementById("game-controls").classList.add("hidden");
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
});
