import React, { useCallback, useState } from 'react';
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

  // Thêm trạng thái để lưu trữ nước đi của người chơi và AI
  const [playerMove, setPlayerMove] = useState<[number, number] | null>(null);
  const [aiMove, setAiMove] = useState<[number, number] | null>(null);

  const handlePress = useCallback(
    async (row: number, col: number) => {
      if (board[row][col] !== null || winner || isAiThinking) return;

      // Player's move
      makeMove(row, col);
      setPlayerMove([row, col]); // Lưu nước đi của người chơi

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

            setAiMove(aiMove); // Lưu nước đi của AI
            // Cập nhật bàn cờ với nước đi của AI
            makeMove(aiMove[0], aiMove[1]);
          } finally {
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
      let cellStyle = styles.cell;

      // Kiểm tra ô của người chơi
      if (playerMove && playerMove[0] === row && playerMove[1] === col) {
        cellStyle = { ...cellStyle, backgroundColor: 'lightblue' }; // Màu cho ô của người chơi
      }

      // Kiểm tra ô của AI
      if (aiMove && aiMove[0] === row && aiMove[1] === col) {
        cellStyle = { ...cellStyle, backgroundColor: 'lightgreen' }; // Màu cho ô của AI
      }

      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          style={cellStyle}
          onPress={() => handlePress(row, col)}
          disabled={
            winner !== null ||
            (gameMode.startsWith('pve-') && currentPlayer === 'white')
          }
        >
          {board[row][col] && (
            <View
              style={[
                styles.stone,
                {
                  backgroundColor:
                    board[row][col] === 'black' ? '#000' : '#fff',
                },
              ]}
            />
          )}
        </TouchableOpacity>
      );
    },
    [board, handlePress, winner, gameMode, currentPlayer, playerMove, aiMove]
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
