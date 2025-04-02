import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Board from '@/components/Board';
import useGameStore from '@/store/gameStore';

export default function PvPScreen() {
  const router = useRouter();
  const {
    currentPlayer,
    winner,
    gameMode,
    initializeBoard,
    undoMove,
    isAiThinking,
  } = useGameStore();

  const getGameModeText = () => {
    switch (gameMode) {
      case 'pvp':
        return 'Player vs Player';
      case 'pve-easy':
        return 'vs AI (Easy)';
      case 'pve-medium':
        return 'vs AI (Medium)';
      case 'pve-hard':
        return 'vs AI (Hard)';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.gameMode}>{getGameModeText()}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.status}>
            {winner
              ? winner === 'draw'
                ? "It's a draw!"
                : `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`
              : `${
                  currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)
                }'s turn`}
          </Text>
          {isAiThinking && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.statusIndicator}
            />
          )}
        </View>
      </View>

      <Board />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={undoMove}
          disabled={winner !== null}
        >
          <RotateCcw size={20} color="#fff" />
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.newGameButton]}
          onPress={initializeBoard}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  gameMode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 18,
    color: '#71717a',
    marginBottom: 20,
  },
  statusIndicator: {
    marginLeft: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newGameButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
