import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import useGameStore, { CellState } from '@/store/gameStore';
import { findEasyMove, findMediumMove, findHardMove } from '@/utils/ai';

const BOARD_SIZE = 15;
const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(width - 40, 400) / BOARD_SIZE;

export default function Board() {
  const { board, currentPlayer, gameMode, makeMove, winner } = useGameStore();

  const handlePress = useCallback(async (row: number, col: number) => {
    if (board[row][col] !== null || winner) return;

    // Player's move
    makeMove(row, col);

    // AI's move (if in PvE mode)
    if (gameMode.startsWith('pve-')) {
      let aiMove: [number, number] = [-1, -1];
      
      switch (gameMode) {
        case 'pve-easy':
          aiMove = findEasyMove(board, currentPlayer);
          break;
        case 'pve-medium':
          aiMove = findMediumMove(board, currentPlayer);
          break;
        case 'pve-hard':
          aiMove = findHardMove(board, currentPlayer);
          break;
      }
      
      if (aiMove[0] !== -1) {
        setTimeout(() => makeMove(aiMove[0], aiMove[1]), 500);
      }
    }
  }, [board, currentPlayer, gameMode, makeMove, winner]);

  const renderCell = useCallback((row: number, col: number) => {
    const value: CellState = board[row][col];
    
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={styles.cell}
        onPress={() => handlePress(row, col)}
        disabled={winner !== null || (gameMode.startsWith('pve-') && currentPlayer === 'white')}
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
  }, [board, handlePress, winner, gameMode, currentPlayer]);

  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#DEB887',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  stone: {
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    borderRadius: CELL_SIZE * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});