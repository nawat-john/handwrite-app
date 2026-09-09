import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HeaderBar } from '../components/Common/HeaderBar';
import { HandwritingCanvas } from '../components/Canvas/HandwritingCanvas';
import { usePracticeStore } from '../store/usePracticeStore';

export const PracticeScreen: React.FC = () => {
  const { strokes, palmRejectionEnabled } = usePracticeStore();

  return (
    <View style={styles.container}>
      {/* Top Controls & Navigation */}
      <HeaderBar />

      {/* Main Drawing Canvas Area */}
      <View style={styles.canvasContainer}>
        <HandwritingCanvas />

        {/* Empty Canvas Helpful Watermark Hint */}
        {strokes.length === 0 && (
          <View pointerEvents="none" style={styles.hintContainer}>
            <Text style={styles.hintTitle}>Cursive Handwriting Canvas</Text>
            <Text style={styles.hintSub}>
              {palmRejectionEnabled
                ? 'Use Apple Pencil to draw smoothly with palm rejection active'
                : 'Draw with Apple Pencil or finger'}
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
  hintContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#CBD5E1',
    letterSpacing: -0.5,
  },
  hintSub: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
  },
});
