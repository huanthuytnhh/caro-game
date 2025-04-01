import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useGameStore from '@/store/gameStore';

export default function HomeScreen() {
  const router = useRouter();
  const setGameMode = useGameStore(state => state.setGameMode);

  const handleModeSelect = (mode: 'pvp' | 'pve-easy' | 'pve-medium' | 'pve-hard') => {
    setGameMode(mode);
    router.push('/pvp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gomoku</Text>
      <Text style={styles.subtitle}>Select Game Mode</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleModeSelect('pvp')}
        >
          <Users size={24} color="#fff" />
          <Text style={styles.buttonText}>Player vs Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.easyButton]}
          onPress={() => handleModeSelect('pve-easy')}
        >
          <Bot size={24} color="#fff" />
          <Text style={styles.buttonText}>vs AI (Easy)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.mediumButton]}
          onPress={() => handleModeSelect('pve-medium')}
        >
          <Bot size={24} color="#fff" />
          <Text style={styles.buttonText}>vs AI (Medium)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.hardButton]}
          onPress={() => handleModeSelect('pve-hard')}
        >
          <Bot size={24} color="#fff" />
          <Text style={styles.buttonText}>vs AI (Hard)</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#71717a',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  easyButton: {
    backgroundColor: '#059669',
  },
  mediumButton: {
    backgroundColor: '#ca8a04',
  },
  hardButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});