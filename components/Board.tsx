import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import useGameStore, { CellState } from '@/store/gameStore';
import { findEasyMove, findMediumMove, findHardMove } from '@/utils/ai';

const BOARD_SIZE = 15;
const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(width - 40, 400) / BOARD_SIZE;

export default function Board() {
  const {
    board,
    currentPlayer,
    gameMode,
    makeMove,
    winner,
    isAiThinking,
    setAiThinking,
  } = useGameStore();

  const handlePress = useCallback(
    async (row: number, col: number) => {
      if (board[row][col] !== null || winner || isAiThinking) return;

      // Player's move
      makeMove(row, col);

      // AI's move (if in PvE mode)
      if (gameMode.startsWith('pve-')) {
        // Bật trạng thái AI đang suy nghĩ
        setAiThinking(true);

        // Sử dụng setTimeout để cho phép UI cập nhật trước khi AI tính toán
        setTimeout(async () => {
          try {
            // Tạo bản sao sâu của bàn cờ hiện tại (deep copy)
            const currentBoard = JSON.parse(JSON.stringify(board));

            // Thêm nước đi của người chơi vào bản sao bàn cờ
            // Điều này đảm bảo AI nhìn thấy nước đi mới nhất của người chơi
            if (board[row][col] === null) {
              currentBoard[row][col] = 'black'; // Người chơi luôn là black
            }

            let aiMove: [number, number] = [-1, -1];

            switch (gameMode) {
              case 'pve-easy':
                aiMove = findEasyMove(currentBoard, currentPlayer);
                break;
              case 'pve-medium':
                aiMove = findMediumMove(currentBoard, currentPlayer);
                break;
              case 'pve-hard':
                aiMove = findHardMove(currentBoard, currentPlayer);
                break;
            }

            // Kiểm tra kỹ lưỡng nước đi của AI
            if (
              aiMove[0] >= 0 &&
              aiMove[0] < BOARD_SIZE &&
              aiMove[1] >= 0 &&
              aiMove[1] < BOARD_SIZE &&
              currentBoard[aiMove[0]][aiMove[1]] === null
            ) {
              // Thêm độ trễ nhỏ để người dùng thấy được thanh loading
              setTimeout(() => {
                makeMove(aiMove[0], aiMove[1]);
                setAiThinking(false);
              }, 300);
            } else {
              console.error(
                `AI returned invalid move: [${aiMove}], finding random empty cell instead`
              );

              // Tìm một ô trống ngẫu nhiên nếu AI trả về nước đi không hợp lệ
              const emptyPositions: [number, number][] = [];
              for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                  if (currentBoard[r][c] === null) {
                    emptyPositions.push([r, c]);
                  }
                }
              }

              if (emptyPositions.length > 0) {
                const randomMove =
                  emptyPositions[
                    Math.floor(Math.random() * emptyPositions.length)
                  ];
                console.log(`Using fallback random move: [${randomMove}]`);
                setTimeout(() => {
                  makeMove(randomMove[0], randomMove[1]);
                  setAiThinking(false);
                }, 300);
              } else {
                setAiThinking(false);
              }
            }
          } catch (error) {
            console.error('Error in AI processing:', error);
            setAiThinking(false);
          }
        }, 50);
      }
    },
    [
      board,
      currentPlayer,
      gameMode,
      makeMove,
      winner,
      isAiThinking,
      setAiThinking,
    ]
  );

  const renderCell = useCallback(
    (row: number, col: number) => {
      const value: CellState = board[row][col];

      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          style={styles.cell}
          onPress={() => handlePress(row, col)}
          disabled={
            winner !== null ||
            (gameMode.startsWith('pve-') && currentPlayer === 'white')
          }
        >
          {value && (
            <View
              style={[
                styles.stone,
                { backgroundColor: value === 'black' ? '#000' : '#fff' },
              ]}
            />
          )}
        </TouchableOpacity>
      );
    },
    [board, handlePress, winner, gameMode, currentPlayer]
  );

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>

      {/* Thanh loading khi AI đang suy nghĩ */}
      {isAiThinking && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    backgroundColor: '#E8C28F',
    borderWidth: 1,
    borderColor: '#000',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  stone: {
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    borderRadius: CELL_SIZE * 0.4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  topBorder: { borderTopWidth: 1 },
  bottomBorder: { borderBottomWidth: 1 },
  leftBorder: { borderLeftWidth: 1 },
  rightBorder: { borderRightWidth: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
