import { CellState, Player } from '@/store/gameStore';

const BOARD_SIZE = 15;

function hasFiveInARow(board: CellState[][], player: Player): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    let count = 0;
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) {
        count++;
        if (count === 5) return true;
      } else {
        count = 0;
      }
    }
  }

  for (let col = 0; col < BOARD_SIZE; col++) {
    let count = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (board[row][col] === player) {
        count++;
        if (count === 5) return true;
      } else {
        count = 0;
      }
    }
  }

  for (let startRow = 0; startRow <= BOARD_SIZE - 5; startRow++) {
    for (let startCol = 0; startCol <= BOARD_SIZE - 5; startCol++) {
      let count = 0;
      for (let i = 0; i < 5; i++) {
        if (board[startRow + i][startCol + i] === player) {
          count++;
          if (count === 5) return true;
        } else {
          count = 0;
        }
      }
    }
  }

  for (let startRow = 0; startRow <= BOARD_SIZE - 5; startRow++) {
    for (let startCol = 4; startCol < BOARD_SIZE; startCol++) {
      let count = 0;
      for (let i = 0; i < 5; i++) {
        if (board[startRow + i][startCol - i] === player) {
          count++;
          if (count === 5) return true;
        } else {
          count = 0;
        }
      }
    }
  }

  return false;
}

function evaluatePatterns(board: CellState[][], player: Player): number {
  let score = 0;
  const opponent = player === 'black' ? 'white' : 'black';
  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal
    [1, -1],  // anti-diagonal
  ];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (const [dx, dy] of directions) {
        let playerCount = 0;
        let opponentCount = 0;
        let empty = 0;

        for (let i = 0; i < 5; i++) {
          const newRow = row + dx * i;
          const newCol = col + dy * i;

          if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
            break;
          }

          const cell = board[newRow][newCol];
          if (cell === player) playerCount++;
          else if (cell === opponent) opponentCount++;
          else empty++;
        }

        if (opponentCount === 0) {
          if (playerCount === 5) score += 100000;
          else if (playerCount === 4) score += empty === 1 ? 10000 : 1000;
          else if (playerCount === 3) score += empty === 2 ? 1000 : 100;
          else if (playerCount === 2) score += empty === 3 ? 100 : 10;
          else if (playerCount === 1) score += empty === 4 ? 10 : 1;
        }
      }
    }
  }

  return score;
}

function evaluateBoard(board: CellState[][], player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  return evaluatePatterns(board, player) - evaluatePatterns(board, opponent);
}

export function findEasyMove(board: CellState[][], player: Player): [number, number] {
  const moves: [number, number][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        moves.push([row, col]);
      }
    }
  }

  return moves[Math.floor(Math.random() * moves.length)];
}

function findWinningMoves(board: CellState[][], player: Player): [number, number][] {
  const moves: [number, number][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        board[row][col] = player;
        if (hasFiveInARow(board, player)) {
          moves.push([row, col]);
        }
        board[row][col] = null;
      }
    }
  }

  return moves;
}

export function findMediumMove(board: CellState[][], player: Player): [number, number] {
  const opponent = player === 'black' ? 'white' : 'black';

  const winningMoves = findWinningMoves(board, player);
  if (winningMoves.length > 0) {
    return winningMoves[Math.floor(Math.random() * winningMoves.length)];
  }

  const blockingMoves = findWinningMoves(board, opponent);
  if (blockingMoves.length > 0) {
    return blockingMoves[Math.floor(Math.random() * blockingMoves.length)];
  }

  let bestScore = -Infinity;
  let bestMoves: [number, number][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        board[row][col] = player;
        const score = evaluatePatterns(board, player) - evaluatePatterns(board, opponent);
        board[row][col] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMoves = [[row, col]];
        } else if (score === bestScore) {
          bestMoves.push([row, col]);
        }
      }
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function minimax(
  board: CellState[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  player: Player
): number {
  const opponent = player === 'black' ? 'white' : 'black';

  if (hasFiveInARow(board, player)) return 100000;
  if (hasFiveInARow(board, opponent)) return -100000;

  if (depth === 0) {
    return evaluatePatterns(board, player) - evaluatePatterns(board, opponent);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    outer: for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === null) {
          board[row][col] = player;
          const score = minimax(board, depth - 1, alpha, beta, false, player);
          board[row][col] = null;
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break outer;
        }
      }
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    outer: for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === null) {
          board[row][col] = opponent;
          const score = minimax(board, depth - 1, alpha, beta, true, player);
          board[row][col] = null;
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break outer;
        }
      }
    }
    return minScore;
  }
}

export function findHardMove(board: CellState[][], player: Player): [number, number] {
  let bestScore = -Infinity;
  let bestMove: [number, number] = [-1, -1];
  const depth = 3;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        board[row][col] = player;
        const score = minimax(board, depth - 1, -Infinity, Infinity, false, player);
        board[row][col] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = [row, col];
        }
      }
    }
  }

  return bestMove;
}