"use strict";

function mergeLine(line) {
  const values = line.filter((value) => value !== 0);
  const merged = [];
  let score = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const combined = values[index] * 2;
      merged.push(combined);
      score += combined;
      index += 1;
    } else {
      merged.push(values[index]);
    }
  }

  while (merged.length < line.length) {
    merged.push(0);
  }

  return { line: merged, score };
}

function initializeGame() {
  const size = 4;
  const boardElement = document.getElementById("board");
  const scoreElement = document.getElementById("score");
  const overlayElement = document.getElementById("overlay");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogMessage = document.getElementById("dialog-message");
  const continueButton = document.getElementById("continue-game");
  const newGameButtons = [
    document.getElementById("new-game"),
    document.getElementById("dialog-new-game")
  ];

  let board = [];
  let score = 0;
  let victoryAcknowledged = false;
  let dialogOpen = false;

  function addTile() {
    const emptyIndexes = [];

    board.forEach((value, index) => {
      if (value === 0) {
        emptyIndexes.push(index);
      }
    });

    if (emptyIndexes.length === 0) {
      return;
    }

    const target = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    board[target] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    boardElement.replaceChildren();
    scoreElement.textContent = String(score);

    board.forEach((value) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("aria-label", value === 0 ? "빈 칸" : String(value));

      if (value !== 0) {
        tile.textContent = String(value);
        tile.classList.add(value <= 2048 ? `tile-${value}` : "tile-high");
      }

      boardElement.appendChild(tile);
    });
  }

  function hideDialog() {
    dialogOpen = false;
    overlayElement.hidden = true;
  }

  function showDialog(type) {
    dialogOpen = true;
    overlayElement.hidden = false;

    if (type === "victory") {
      dialogTitle.textContent = "2048 완성!";
      dialogMessage.textContent = "축하합니다. 계속 플레이하거나 새 게임을 시작할 수 있어요.";
      continueButton.hidden = false;
      continueButton.focus();
    } else {
      dialogTitle.textContent = "게임 오버";
      dialogMessage.textContent = "더 이상 움직일 수 없습니다. 새 게임에 도전해 보세요.";
      continueButton.hidden = true;
      document.getElementById("dialog-new-game").focus();
    }
  }

  function isGameOver() {
    if (board.includes(0)) {
      return false;
    }

    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        const index = row * size + column;

        if (column < size - 1 && board[index] === board[index + 1]) {
          return false;
        }

        if (row < size - 1 && board[index] === board[index + size]) {
          return false;
        }
      }
    }

    return true;
  }

  function move(direction) {
    if (dialogOpen) {
      return;
    }

    const horizontal = direction === "left" || direction === "right";
    const reversed = direction === "right" || direction === "down";
    const nextBoard = Array(size * size).fill(0);
    let gainedScore = 0;

    for (let lane = 0; lane < size; lane += 1) {
      const line = [];

      for (let offset = 0; offset < size; offset += 1) {
        const index = horizontal ? lane * size + offset : offset * size + lane;
        line.push(board[index]);
      }

      if (reversed) {
        line.reverse();
      }

      const result = mergeLine(line);
      const mergedLine = reversed ? result.line.slice().reverse() : result.line;
      gainedScore += result.score;

      for (let offset = 0; offset < size; offset += 1) {
        const index = horizontal ? lane * size + offset : offset * size + lane;
        nextBoard[index] = mergedLine[offset];
      }
    }

    const changed = board.some((value, index) => value !== nextBoard[index]);

    if (!changed) {
      return;
    }

    board = nextBoard;
    score += gainedScore;
    addTile();
    render();

    if (!victoryAcknowledged && board.some((value) => value >= 2048)) {
      showDialog("victory");
    } else if (isGameOver()) {
      showDialog("game-over");
    }
  }

  function startNewGame() {
    board = Array(size * size).fill(0);
    score = 0;
    victoryAcknowledged = false;
    hideDialog();
    addTile();
    addTile();
    render();
  }

  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.direction));
  });

  document.addEventListener("keydown", (event) => {
    const directions = {
      ArrowUp: "up",
      ArrowLeft: "left",
      ArrowDown: "down",
      ArrowRight: "right"
    };
    const direction = directions[event.key];

    if (direction) {
      event.preventDefault();
      move(direction);
    }
  });

  newGameButtons.forEach((button) => {
    button.addEventListener("click", startNewGame);
  });

  continueButton.addEventListener("click", () => {
    victoryAcknowledged = true;
    hideDialog();

    if (isGameOver()) {
      showDialog("game-over");
    }
  });

  startNewGame();
}

if (typeof document !== "undefined") {
  initializeGame();
}
