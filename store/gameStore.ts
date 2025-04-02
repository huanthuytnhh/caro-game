import { create } from 'zustand';

export type Player = 'black' | 'white';
export type GameMode = 'pvp' | 'pve-easy' | 'pve-medium' | 'pve-hard';
export type CellState = Player | null;

interface GameState {
  board: CellState[][];
  currentPlayer: Player;
  gameMode: GameMode;
  winner: Player | 'draw' | null;
  moveHistory: { row: number; col: number; player: Player }[];
  isAiThinking: boolean;

  initializeBoard: () => void;
  makeMove: (row: number, col: number) => void;
  setGameMode: (mode: GameMode) => void;
  undoMove: () => void;
  setAiThinking: (isThinking: boolean) => void;
}

const BOARD_SIZE = 15;

const useGameStore = create<GameState>((set, get) => ({
  board: Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null)),
  currentPlayer: 'black',
  gameMode: 'pvp',
  winner: null,
  moveHistory: [],
  isAiThinking: false,

  initializeBoard: () => {
    set({
      board: Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null)),
      currentPlayer: 'black',
      winner: null,
      moveHistory: [],
    });
  },

  makeMove: (row: number, col: number) => {
    const { board, currentPlayer, moveHistory } = get();

    if (board[row][col] !== null || get().winner) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;

    const newMoveHistory = [
      ...moveHistory,
      { row, col, player: currentPlayer },
    ];

    set({
      board: newBoard,
      currentPlayer: currentPlayer === 'black' ? 'white' : 'black',
      moveHistory: newMoveHistory,
      winner: checkWinner(newBoard, row, col, currentPlayer),
    });
  },

  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
    get().initializeBoard();
  },

  undoMove: () => {
    const { moveHistory, gameMode } = get();
    if (moveHistory.length === 0) return;

    // For PvE modes, undo both AI and player moves
    const movesToUndo = gameMode.startsWith('pve-') ? 2 : 1;
    const newHistory = moveHistory.slice(0, -movesToUndo);

    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null));
    newHistory.forEach(({ row, col, player }) => {
      newBoard[row][col] = player;
    });

    set({
      board: newBoard,
      currentPlayer:
        moveHistory[moveHistory.length - movesToUndo]?.player === 'black'
          ? 'black'
          : 'white',
      moveHistory: newHistory,
      winner: null,
    });
  },

  setAiThinking: (isThinking: boolean) => {
    set({ isAiThinking: isThinking });
  },
}));

function checkWinner(
  board: CellState[][],
  row: number,
  col: number,
  player: Player
): Player | 'draw' | null {
  const directions = [
    [1, 0], // horizontal
    [0, 1], // vertical
    [1, 1], // diagonal
    [1, -1], // anti-diagonal
  ];

  for (const [dx, dy] of directions) {
    let count = 1;

    // Check forward direction
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (
        newRow < 0 ||
        newRow >= BOARD_SIZE ||
        newCol < 0 ||
        newCol >= BOARD_SIZE ||
        board[newRow][newCol] !== player
      )
        break;
      count++;
    }

    // Check backward direction
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (
        newRow < 0 ||
        newRow >= BOARD_SIZE ||
        newCol < 0 ||
        newCol >= BOARD_SIZE ||
        board[newRow][newCol] !== player
      )
        break;
      count++;
    }

    if (count >= 5) return player;
  }

  // Check for draw
  if (board.every((row) => row.every((cell) => cell !== null))) {
    return 'draw';
  }

  return null;
}

export default useGameStore;
