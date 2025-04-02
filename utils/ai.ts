import { CellState, Player } from '@/store/gameStore';

const BOARD_SIZE = 15;

// Hàm kiểm tra chiến thắng
function hasFiveInARow(board: CellState[][], player: Player): boolean {
  // Kiểm tra hàng ngang
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col <= BOARD_SIZE - 5; col++) {
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row][col + 3] === player &&
        board[row][col + 4] === player
      ) {
        return true;
      }
    }
  }

  // Kiểm tra hàng dọc
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row <= BOARD_SIZE - 5; row++) {
      if (
        board[row][col] === player &&
        board[row + 1][col] === player &&
        board[row + 2][col] === player &&
        board[row + 3][col] === player &&
        board[row + 4][col] === player
      ) {
        return true;
      }
    }
  }

  // Kiểm tra đường chéo xuống
  for (let row = 0; row <= BOARD_SIZE - 5; row++) {
    for (let col = 0; col <= BOARD_SIZE - 5; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col + 1] === player &&
        board[row + 2][col + 2] === player &&
        board[row + 3][col + 3] === player &&
        board[row + 4][col + 4] === player
      ) {
        return true;
      }
    }
  }

  // Kiểm tra đường chéo lên
  for (let row = 4; row < BOARD_SIZE; row++) {
    for (let col = 0; col <= BOARD_SIZE - 5; col++) {
      if (
        board[row][col] === player &&
        board[row - 1][col + 1] === player &&
        board[row - 2][col + 2] === player &&
        board[row - 3][col + 3] === player &&
        board[row - 4][col + 4] === player
      ) {
        return true;
      }
    }
  }

  return false;
}

// Hàm tìm tất cả các ô trống
function findAllEmptyCells(board: CellState[][]): [number, number][] {
  const moves: [number, number][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        moves.push([row, col]);
      }
    }
  }

  return moves;
}

// Hàm tìm các ô trống gần quân cờ đã đặt
function getNearbyEmptyCells(board: CellState[][]): [number, number][] {
  const moves: [number, number][] = [];
  const visited = Array(BOARD_SIZE)
    .fill(0)
    .map(() => Array(BOARD_SIZE).fill(false));

  // Kiểm tra bàn cờ có quân nào không
  let hasStones = false;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        hasStones = true;
        // Thêm các ô xung quanh
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (
              newRow >= 0 &&
              newRow < BOARD_SIZE &&
              newCol >= 0 &&
              newCol < BOARD_SIZE &&
              board[newRow][newCol] === null &&
              !visited[newRow][newCol]
            ) {
              moves.push([newRow, newCol]);
              visited[newRow][newCol] = true;
            }
          }
        }
      }
    }
  }

  // Nếu bàn cờ trống, đặt ở giữa
  if (!hasStones) {
    const middle = Math.floor(BOARD_SIZE / 2);
    return [[middle, middle]];
  }

  return moves.length > 0 ? moves : findAllEmptyCells(board);
}

// Hàm tìm các nước đi thắng ngay lập tức
function findWinningMoves(
  board: CellState[][],
  player: Player
): [number, number][] {
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

// Hàm đánh giá các mẫu cờ
function evaluatePattern(pattern: string): number {
  // Mẫu thắng: 5 quân liên tiếp
  if (pattern.includes('OOOOO')) return 100000;

  // Mẫu 4 quân liên tiếp
  if (pattern.includes('.OOOO.')) return 10000; // Mở hai đầu
  if (pattern.includes('XOOOO.') || pattern.includes('.OOOOX')) return 1000; // Mở một đầu

  // Mẫu 3 quân liên tiếp
  if (pattern.includes('.OOO..') || pattern.includes('..OOO.')) return 500; // Mở hai đầu
  if (pattern.includes('.OOO.')) return 200; // Mở hai đầu nhưng có khoảng cách
  if (pattern.includes('XOOO..') || pattern.includes('..OOOX')) return 50; // Mở một đầu

  // Mẫu 2 quân liên tiếp
  if (pattern.includes('.OO...') || pattern.includes('...OO.')) return 10; // Mở hai đầu
  if (pattern.includes('.OO..') || pattern.includes('..OO.')) return 5; // Mở một đầu

  return 0;
}

// Hàm đánh giá bàn cờ
function evaluateBoard(board: CellState[][], player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let score = 0;

  // Đánh giá theo hàng
  for (let row = 0; row < BOARD_SIZE; row++) {
    let rowString = '';
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) rowString += 'O';
      else if (board[row][col] === opponent) rowString += 'X';
      else rowString += '.';
    }
    score += evaluatePattern(rowString);
  }

  // Đánh giá theo cột
  for (let col = 0; col < BOARD_SIZE; col++) {
    let colString = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (board[row][col] === player) colString += 'O';
      else if (board[row][col] === opponent) colString += 'X';
      else colString += '.';
    }
    score += evaluatePattern(colString);
  }

  // Đánh giá theo đường chéo xuống
  for (let startRow = 0; startRow < BOARD_SIZE; startRow++) {
    let diagString = '';
    for (let i = 0; i + startRow < BOARD_SIZE && i < BOARD_SIZE; i++) {
      if (board[startRow + i][i] === player) diagString += 'O';
      else if (board[startRow + i][i] === opponent) diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  for (let startCol = 1; startCol < BOARD_SIZE; startCol++) {
    let diagString = '';
    for (let i = 0; i + startCol < BOARD_SIZE && i < BOARD_SIZE; i++) {
      if (board[i][startCol + i] === player) diagString += 'O';
      else if (board[i][startCol + i] === opponent) diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  // Đánh giá theo đường chéo lên
  for (let startRow = 0; startRow < BOARD_SIZE; startRow++) {
    let diagString = '';
    for (let i = 0; startRow + i < BOARD_SIZE && i < BOARD_SIZE; i++) {
      if (board[startRow + i][BOARD_SIZE - 1 - i] === player) diagString += 'O';
      else if (board[startRow + i][BOARD_SIZE - 1 - i] === opponent)
        diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  for (let startCol = 0; startCol < BOARD_SIZE - 1; startCol++) {
    let diagString = '';
    for (let i = 0; i <= startCol && i < BOARD_SIZE; i++) {
      if (board[i][startCol - i] === player) diagString += 'O';
      else if (board[i][startCol - i] === opponent) diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  // Đánh giá đối thủ
  const opponentScore = evaluateOpponent(board, opponent);

  // Trả về điểm số cuối cùng (ưu tiên phòng thủ một chút)
  return score - opponentScore * 1.1;
}

// Hàm đánh giá đối thủ
function evaluateOpponent(board: CellState[][], opponent: Player): number {
  const player = opponent === 'black' ? 'white' : 'black';
  let score = 0;

  // Đánh giá theo hàng
  for (let row = 0; row < BOARD_SIZE; row++) {
    let rowString = '';
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === opponent) rowString += 'O';
      else if (board[row][col] === player) rowString += 'X';
      else rowString += '.';
    }
    score += evaluatePattern(rowString);
  }

  // Đánh giá theo cột
  for (let col = 0; col < BOARD_SIZE; col++) {
    let colString = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (board[row][col] === opponent) colString += 'O';
      else if (board[row][col] === player) colString += 'X';
      else colString += '.';
    }
    score += evaluatePattern(colString);
  }

  // Đánh giá theo đường chéo xuống
  for (let startRow = 0; startRow < BOARD_SIZE; startRow++) {
    let diagString = '';
    for (let i = 0; i + startRow < BOARD_SIZE && i < BOARD_SIZE; i++) {
      if (board[startRow + i][i] === opponent) diagString += 'O';
      else if (board[startRow + i][i] === player) diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  for (let startCol = 1; startCol < BOARD_SIZE; startCol++) {
    let diagString = '';
    for (let i = 0; i + startCol < BOARD_SIZE && i < BOARD_SIZE; i++) {
      if (board[i][startCol + i] === opponent) diagString += 'O';
      else if (board[i][startCol + i] === player) diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  // Đánh giá theo đường chéo lên
  for (let startRow = 0; startRow < BOARD_SIZE; startRow++) {
    let diagString = '';
    for (let i = 0; startRow + i < BOARD_SIZE && i < BOARD_SIZE; i++) {
      if (board[startRow + i][BOARD_SIZE - 1 - i] === opponent)
        diagString += 'O';
      else if (board[startRow + i][BOARD_SIZE - 1 - i] === player)
        diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  for (let startCol = 0; startCol < BOARD_SIZE - 1; startCol++) {
    let diagString = '';
    for (let i = 0; i <= startCol && i < BOARD_SIZE; i++) {
      if (board[i][startCol - i] === opponent) diagString += 'O';
      else if (board[i][startCol - i] === player) diagString += 'X';
      else diagString += '.';
    }
    if (diagString.length >= 5) score += evaluatePattern(diagString);
  }

  return score;
}

// Thêm hàm log để theo dõi quá trình suy nghĩ của AI
function logAIProgress(message: string) {
  console.log(`[AI Progress]: ${message}`);
}

// Thêm hàm kiểm tra nước đi hợp lệ (nếu chưa có)
function isValidMove(board: CellState[][], row: number, col: number): boolean {
  return (
    row >= 0 &&
    row < BOARD_SIZE &&
    col >= 0 &&
    col < BOARD_SIZE &&
    board[row][col] === null
  );
}

// Thuật toán minimax với alpha-beta pruning
function minimax(
  board: CellState[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  player: Player,
  startTime: number,
  timeLimit: number
): { value: number; timeout: boolean } {
  const opponent = player === 'black' ? 'white' : 'black';
  const elapsedTime = Date.now() - startTime;

  // Kiểm tra thời gian
  if (elapsedTime > timeLimit * 0.9) {
    logAIProgress(
      `Timeout occurred at depth ${depth}, elapsed time: ${elapsedTime}ms`
    );
    return { value: 0, timeout: true };
  }

  // Kiểm tra chiến thắng
  if (hasFiveInARow(board, player)) {
    logAIProgress(`Found winning position for ${player} at depth ${depth}`);
    return { value: 100000 + depth, timeout: false };
  }

  if (hasFiveInARow(board, opponent)) {
    logAIProgress(
      `Found losing position against ${opponent} at depth ${depth}`
    );
    return { value: -100000 - depth, timeout: false };
  }

  // Nếu đạt độ sâu tối đa, đánh giá bàn cờ
  if (depth === 0) {
    const value = evaluateBoard(board, player);
    logAIProgress(`Leaf node evaluation at depth 0: ${value}`);
    return { value, timeout: false };
  }

  const possibleMoves = getNearbyEmptyCells(board).filter(
    ([r, c]) => board[r][c] === null
  );
  logAIProgress(
    `Analyzing ${possibleMoves.length} possible moves at depth ${depth}`
  );

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [row, col] of possibleMoves) {
      board[row][col] = player;
      const evalResult = minimax(
        board,
        depth - 1,
        alpha,
        beta,
        false,
        player,
        startTime,
        timeLimit
      );
      board[row][col] = null;

      if (evalResult.timeout) {
        logAIProgress(
          `Propagating timeout from depth ${depth - 1} to ${depth}`
        );
        return { value: 0, timeout: true };
      }

      maxEval = Math.max(maxEval, evalResult.value);
      alpha = Math.max(alpha, evalResult.value);

      if (beta <= alpha) {
        logAIProgress(
          `Alpha-beta pruning at depth ${depth}, alpha: ${alpha}, beta: ${beta}`
        );
        break;
      }
    }
    logAIProgress(`Max evaluation at depth ${depth}: ${maxEval}`);
    return { value: maxEval, timeout: false };
  } else {
    let minEval = Infinity;
    for (const [row, col] of possibleMoves) {
      board[row][col] = opponent;
      const evalResult = minimax(
        board,
        depth - 1,
        alpha,
        beta,
        true,
        player,
        startTime,
        timeLimit
      );
      board[row][col] = null;

      if (evalResult.timeout) {
        logAIProgress(
          `Propagating timeout from depth ${depth - 1} to ${depth}`
        );
        return { value: 0, timeout: true };
      }

      minEval = Math.min(minEval, evalResult.value);
      beta = Math.min(beta, evalResult.value);

      if (beta <= alpha) {
        logAIProgress(
          `Alpha-beta pruning at depth ${depth}, alpha: ${alpha}, beta: ${beta}`
        );
        break;
      }
    }
    logAIProgress(`Min evaluation at depth ${depth}: ${minEval}`);
    return { value: minEval, timeout: false };
  }
}

// Hàm tìm nước đi dễ (ngẫu nhiên)
export function findEasyMove(
  board: CellState[][],
  player: Player
): [number, number] {
  const moves = findAllEmptyCells(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

// Hàm tìm nước đi trung bình
export function findMediumMove(
  board: CellState[][],
  player: Player
): [number, number] {
  logAIProgress(`Starting AI medium move calculation for ${player}`);
  const opponent = player === 'black' ? 'white' : 'black';

  // Kiểm tra nước thắng
  const winningMoves = findWinningMoves(board, player);
  if (winningMoves.length > 0) {
    const selectedMove =
      winningMoves[Math.floor(Math.random() * winningMoves.length)];
    logAIProgress(`Found winning move at ${selectedMove}`);
    return selectedMove;
  }

  // Kiểm tra nước chặn
  const blockingMoves = findWinningMoves(board, opponent);
  if (blockingMoves.length > 0) {
    const selectedMove =
      blockingMoves[Math.floor(Math.random() * blockingMoves.length)];
    logAIProgress(`Found blocking move at ${selectedMove}`);
    return selectedMove;
  }

  // Kiểm tra các nước có thể
  const possibleMoves = getNearbyEmptyCells(board);
  logAIProgress(`Found ${possibleMoves.length} nearby empty cells`);

  // Đánh giá từng nước đi
  let bestScore = -Infinity;
  let bestMoves: [number, number][] = [];

  for (const [row, col] of possibleMoves) {
    board[row][col] = player;
    const score = evaluateBoard(board, player);
    board[row][col] = null;
    logAIProgress(`Move [${row},${col}] scored: ${score}`);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[row, col]];
      logAIProgress(`New best move: [${row},${col}] with score ${score}`);
    } else if (score === bestScore) {
      bestMoves.push([row, col]);
      logAIProgress(
        `Added equal best move: [${row},${col}] with score ${score}`
      );
    }
  }

  if (bestMoves.length === 0) {
    logAIProgress(`No best moves found, falling back to random move`);
    const allEmpty = findAllEmptyCells(board);
    const randomMove = allEmpty[Math.floor(Math.random() * allEmpty.length)];
    return randomMove;
  }

  const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  logAIProgress(
    `Selected medium move: [${selectedMove}] from ${bestMoves.length} best moves`
  );
  return selectedMove;
}

// Hàm tìm nước đi khó
export function findHardMove(
  board: CellState[][],
  player: Player
): [number, number] {
  const opponent = player === 'black' ? 'white' : 'black';
  const timeLimit = 800;
  const startTime = Date.now();

  logAIProgress(`Starting AI hard move calculation for ${player}`);

  // Kiểm tra nước thắng
  const winningMoves = findWinningMoves(board, player);
  if (winningMoves.length > 0) {
    const selectedMove =
      winningMoves[Math.floor(Math.random() * winningMoves.length)];
    logAIProgress(`Found winning move at [${selectedMove}]`);
    if (isValidMove(board, selectedMove[0], selectedMove[1])) {
      return selectedMove;
    } else {
      logAIProgress(
        `WARNING: Invalid winning move detected: [${selectedMove}]`
      );
    }
  }

  // Kiểm tra nước chặn
  const blockingMoves = findWinningMoves(board, opponent);
  if (blockingMoves.length > 0) {
    const selectedMove =
      blockingMoves[Math.floor(Math.random() * blockingMoves.length)];
    logAIProgress(`Found blocking move at [${selectedMove}]`);
    if (isValidMove(board, selectedMove[0], selectedMove[1])) {
      return selectedMove;
    } else {
      logAIProgress(
        `WARNING: Invalid blocking move detected: [${selectedMove}]`
      );
    }
  }

  // Lấy các ô gần quân đã đặt (chỉ lấy ô trống)
  const possibleMoves = getNearbyEmptyCells(board).filter((move) =>
    isValidMove(board, move[0], move[1])
  );

  logAIProgress(`Found ${possibleMoves.length} valid nearby empty cells`);

  // Nếu không có nước đi hợp lệ, tìm tất cả các ô trống
  if (possibleMoves.length === 0) {
    const allEmpty = findAllEmptyCells(board);
    if (allEmpty.length > 0) {
      const randomMove = allEmpty[Math.floor(Math.random() * allEmpty.length)];
      logAIProgress(
        `No valid moves found, selecting random empty cell: [${randomMove}]`
      );
      return randomMove;
    }
    logAIProgress(`ERROR: No empty cells found on the board!`);
    // Trả về một vị trí không hợp lệ để xử lý ở UI
    return [-1, -1];
  }

  // Sắp xếp các nước đi theo đánh giá sơ bộ
  const scoredMoves: { move: [number, number]; score: number }[] = [];

  for (const move of possibleMoves) {
    const [row, col] = move;
    board[row][col] = player;
    const score = evaluateBoard(board, player);
    board[row][col] = null;
    scoredMoves.push({ move, score });
    logAIProgress(`Initial evaluation for move [${row},${col}]: ${score}`);
  }

  // Sắp xếp các nước đi theo thứ tự giảm dần điểm số
  scoredMoves.sort((a, b) => b.score - a.score);
  const orderedMoves = scoredMoves.map((item) => item.move);

  if (scoredMoves.length > 0) {
    logAIProgress(
      `Top 3 initial moves: ${JSON.stringify(scoredMoves.slice(0, 3))}`
    );
  }

  // Nếu không có nước đi, trả về một nước ngẫu nhiên
  if (orderedMoves.length === 0) {
    logAIProgress(`No ordered moves found, searching for any empty cell`);
    const allEmpty = findAllEmptyCells(board);
    if (allEmpty.length > 0) {
      const randomMove = allEmpty[Math.floor(Math.random() * allEmpty.length)];
      logAIProgress(
        `Selected random move from all empty cells: [${randomMove}]`
      );
      return randomMove;
    }
    const centerMove: [number, number] = [
      Math.floor(BOARD_SIZE / 2),
      Math.floor(BOARD_SIZE / 2),
    ];
    logAIProgress(
      `No empty cells found, defaulting to center: [${centerMove}]`
    );
    return centerMove;
  }

  let bestMove: [number, number] = orderedMoves[0];
  let bestScore = -Infinity;

  // Thử tìm kiếm với độ sâu tăng dần
  const maxDepth = Math.min(2, orderedMoves.length > 10 ? 1 : 2);
  logAIProgress(`Starting iterative deepening with max depth: ${maxDepth}`);

  try {
    for (let depth = 1; depth <= maxDepth; depth++) {
      const currentElapsedTime = Date.now() - startTime;
      if (currentElapsedTime > timeLimit * 0.4) {
        logAIProgress(
          `Early termination at depth ${depth}, elapsed time: ${currentElapsedTime}ms exceeds ${
            timeLimit * 0.4
          }ms`
        );
        break;
      }

      logAIProgress(`Starting search at depth ${depth}`);
      let currentBestMove: [number, number] = bestMove;
      let currentBestScore = -Infinity;
      let alpha = -Infinity;
      let beta = Infinity;
      let timeoutOccurred = false;

      // Chỉ xem xét 10 nước đi đầu tiên
      const limitedMoves = orderedMoves.slice(0, 10);
      logAIProgress(`Limiting search to top ${limitedMoves.length} moves`);

      for (const [row, col] of limitedMoves) {
        const moveElapsedTime = Date.now() - startTime;
        if (moveElapsedTime > timeLimit * 0.7) {
          logAIProgress(
            `Time limit reached during move analysis at [${row},${col}], elapsed: ${moveElapsedTime}ms`
          );
          timeoutOccurred = true;
          break;
        }

        // Kiểm tra lại một lần nữa trước khi đánh giá
        if (board[row][col] !== null) {
          logAIProgress(`Skipping occupied cell at [${row},${col}]`);
          continue;
        }

        logAIProgress(`Analyzing move [${row},${col}] at depth ${depth}`);
        board[row][col] = player;
        const score = minimax(
          board,
          depth - 1,
          alpha,
          beta,
          false,
          player,
          startTime,
          timeLimit
        );
        board[row][col] = null;

        if (score.timeout) {
          logAIProgress(
            `Timeout occurred during minimax for move [${row},${col}]`
          );
          timeoutOccurred = true;
          break;
        }

        logAIProgress(
          `Move [${row},${col}] at depth ${depth} scored: ${score.value}`
        );
        if (score.value > currentBestScore) {
          currentBestScore = score.value;
          currentBestMove = [row, col];
          logAIProgress(
            `New best move: [${row},${col}] with score ${score.value}`
          );
        }

        alpha = Math.max(alpha, currentBestScore);
      }

      if (!timeoutOccurred) {
        bestMove = currentBestMove;
        bestScore = currentBestScore;
        logAIProgress(
          `Completed depth ${depth} search, best move: [${bestMove}] with score ${bestScore}`
        );
      } else {
        logAIProgress(
          `Stopping iterative deepening at depth ${depth} due to timeout`
        );
        break;
      }
    }
  } catch (error) {
    logAIProgress(`ERROR in AI calculation: ${error}`);
    // Nếu có lỗi, trả về nước đi đầu tiên
    if (orderedMoves.length > 0) {
      logAIProgress(
        `Falling back to top scored move due to error: [${orderedMoves[0]}]`
      );
      return orderedMoves[0];
    }
  }

  // Kiểm tra cuối cùng trước khi trả về
  if (!isValidMove(board, bestMove[0], bestMove[1])) {
    logAIProgress(
      `CRITICAL ERROR: Final move [${bestMove}] is invalid or occupied!`
    );

    // Tìm một ô trống ngẫu nhiên
    const allEmpty = findAllEmptyCells(board);

    if (allEmpty.length > 0) {
      const safeMove = allEmpty[Math.floor(Math.random() * allEmpty.length)];
      logAIProgress(`Using safe random move: [${safeMove}]`);
      return safeMove;
    }

    return [-1, -1];
  }

  const totalTime = Date.now() - startTime;
  logAIProgress(
    `AI completed thinking in ${totalTime}ms, selected move: [${bestMove}] with score ${bestScore}`
  );
  return bestMove;
}
