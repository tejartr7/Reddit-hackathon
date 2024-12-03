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
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 25px)`; // Set grid size

    board.forEach((row, x) => {
      row.forEach((cell, y) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.style.backgroundColor =
          (x + y) % 2 === 0 ? "white" : "black"; // Alternate colors
        cellElement.style.color = (x + y) % 2 === 0 ? "black" : "white"; // Text visibility
        cellElement.textContent = cell ? "Q" : ""; // Display queen if present
        cellElement.addEventListener("click", () => placeQueen(x, y));
        boardElement.appendChild(cellElement);
      });
    });
  };

  const validateQueenPlacement = (x, y) => {
    for (let queen of queensPlaced) {
      if (
        queen.x === x ||
        queen.y === y ||
        Math.abs(queen.x - x) === Math.abs(queen.y - y)
      ) {
        showError("Invalid Queen Placement!");
        return false;
      }
    }
    hideError();
    return true;
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
      if (queensPlaced.length === boardSize) handleRoundWin();
    }
    updateUI();
  };

  const handleRoundWin = () => {
    if (gameRound < 4) {
      gameRound++;
      boardSize += 2;
      board = Array.from({ length: boardSize }, () =>
        Array(boardSize).fill(false)
      );
      queensPlaced = [];
      maxMistakes++;
      gameStatus = "playing";
    } else {
      gameStatus = "won";
      showError("Congratulations! You've won the game!");
    }
    showControls();
    updateUI();
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
      .classList.toggle("hidden", gameStatus !== "won");
  };

  const hideControls = () => {
    document.getElementById("game-controls").classList.add("hidden");
  };

  document.getElementById("restart-game").addEventListener("click", resetGame);
  document
    .getElementById("next-round")
    .addEventListener("click", handleRoundWin);

  return { init: updateUI };
})();

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  app.init();
});
