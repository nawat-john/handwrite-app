import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HeaderBar } from '../components/Common/HeaderBar';
import { HandwritingCanvas } from '../components/Canvas/HandwritingCanvas';
import { usePracticeStore } from '../store/usePracticeStore';

export const PracticeScreen: React.FC = () => {
  const { strokes, mode, currentText } = usePracticeStore();

  return (
    <View style={styles.container}>
      {/* Top Controls & Navigation */}
      <HeaderBar />

      {/* Main Drawing Canvas Area */}
      <View style={styles.canvasContainer}>
        {/* Blank Mode Reference Card */}
        {mode === 'blank' && (
          <View style={styles.referenceCard}>
            <Text style={styles.referenceLabel}>REFERENCE PROMPT</Text>
            <Text style={styles.referenceText}>{currentText}</Text>
          </View>
        )}

        <HandwritingCanvas />

        {/* Empty Canvas Helpful Watermark Hint */}
        {strokes.length === 0 && (
          <View pointerEvents="none" style={styles.hintContainer}>
            <Text style={styles.hintSub}>
              {mode === 'trace'
                ? 'Follow the dashed cursive guidelines with your Apple Pencil'
                : 'Write the prompt text freely on the guidelines below'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  referenceCard: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 20,
  },
  referenceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  referenceText: {
    fontFamily: 'LearningCurvePro',
    fontSize: 26,
    color: '#1E293B',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  hintSub: {
    fontSize: 13,
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});
