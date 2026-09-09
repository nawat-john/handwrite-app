import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useFont } from '@shopify/react-native-skia';
import { HeaderBar } from '../components/Common/HeaderBar';
import { HandwritingCanvas } from '../components/Canvas/HandwritingCanvas';
import { CategoryPickerModal } from '../components/Common/CategoryPickerModal';
import { ScoreModal } from '../components/Evaluation/ScoreModal';
import { usePracticeStore } from '../store/usePracticeStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { evaluateHandwriting } from '../engine/imageEvaluator';

export const PracticeScreen: React.FC = () => {
  const {
    strokes,
    mode,
    currentText,
    currentExercise,
    guidelineBaseY,
    evaluationResult,
    setEvaluationResult,
    setIsEvaluating,
    markExerciseCompleted,
    nextExercise,
    clearCanvas,
  } = usePracticeStore();

  const [curriculumModalVisible, setCurriculumModalVisible] = useState<boolean>(false);

  // Solid cursive font used as the evaluation template mask
  const evalFont = useFont(
    require('../../assets/fonts/LearningCurvePro.otf'),
    96
  );

  const handleEvaluate = useCallback(() => {
    if (!evalFont || strokes.length === 0) return;

    setIsEvaluating(true);
    setTimeout(() => {
      try {
        const result = evaluateHandwriting({
          strokes,
          targetText: currentText,
          font: evalFont,
          mode,
          baseLineY: guidelineBaseY,
        });
        setEvaluationResult(result);

        // Persist attempt and update best score
        useHistoryStore.getState().recordAttempt({
          exerciseId: currentExercise.id,
          exerciseText: currentText,
          category: currentExercise.category,
          mode,
          score: result.score,
          rating: result.rating,
          ratingColor: result.ratingColor,
          coverageScore: result.coverageScore,
          spillPenalty: result.spillPenalty,
          slopePenalty: result.slopePenalty,
          slopeAngle: result.slopeAngle,
          feedback: result.feedback,
          timestamp: Date.now(),
        });

        // Auto-advance criteria: score >= 75% marks exercise as completed
        if (result.score >= 75) {
          markExerciseCompleted(currentExercise.id);
        }
      } catch (err) {
        console.error('Handwriting evaluation failed:', err);
      } finally {
        setIsEvaluating(false);
      }
    }, 20);
  }, [
    evalFont,
    strokes,
    currentText,
    currentExercise,
    mode,
    guidelineBaseY,
    setEvaluationResult,
    setIsEvaluating,
    markExerciseCompleted,
  ]);

  return (
    <View style={styles.container}>
      {/* Top Controls & Navigation */}
      <HeaderBar
        onEvaluate={handleEvaluate}
        onOpenCurriculum={() => setCurriculumModalVisible(true)}
      />

      {/* Main Drawing Canvas Area */}
      <View style={styles.canvasContainer}>
        {/* Blank Mode Reference Card */}
        {mode === 'blank' && (
          <View style={styles.referenceCard}>
            <Text style={styles.referenceLabel}>
              {currentExercise.category.toUpperCase()} • LEVEL {currentExercise.difficulty}
            </Text>
            <Text style={styles.referenceText}>{currentText}</Text>
            {currentExercise.subText && (
              <Text style={styles.referenceSub}>{currentExercise.subText}</Text>
            )}
          </View>
        )}

        <HandwritingCanvas />

        {/* Empty Canvas Helpful Watermark Hint */}
        {strokes.length === 0 && !evaluationResult && (
          <View pointerEvents="none" style={styles.hintContainer}>
            <Text style={styles.hintInstruction}>{currentExercise.instruction}</Text>
            <Text style={styles.hintSub}>
              {mode === 'trace'
                ? 'Trace along the dashed cursive guidelines with your Apple Pencil'
                : 'Write freely following the 4-line guidelines'}
            </Text>
          </View>
        )}
      </View>

      {/* Visual Feedback Modal (Task 6) */}
      <ScoreModal
        visible={evaluationResult !== null}
        result={evaluationResult}
        exerciseText={currentText}
        onClose={() => setEvaluationResult(null)}
        onTryAgain={() => {
          clearCanvas();
        }}
        onNextExercise={() => {
          nextExercise();
        }}
      />

      {/* Curriculum Picker Modal */}
      <CategoryPickerModal
        visible={curriculumModalVisible}
        onClose={() => setCurriculumModalVisible(false)}
      />
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
    paddingHorizontal: 22,
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
  referenceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  hintInstruction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  hintSub: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
