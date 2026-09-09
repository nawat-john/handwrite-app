import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useFont } from '@shopify/react-native-skia';
import { HeaderBar } from '../components/Common/HeaderBar';
import { HandwritingCanvas } from '../components/Canvas/HandwritingCanvas';
import { CategoryPickerModal } from '../components/Common/CategoryPickerModal';
import { usePracticeStore } from '../store/usePracticeStore';
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

        {/* Evaluation Result HUD Card */}
        {evaluationResult && (
          <View style={styles.evalCard}>
            <View style={styles.evalTopRow}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scoreValue, { color: evaluationResult.ratingColor }]}>
                  {evaluationResult.score}%
                </Text>
              </View>

              <View style={styles.evalMeta}>
                <View style={[styles.ratingBadge, { backgroundColor: evaluationResult.ratingColor + '20' }]}>
                  <Text style={[styles.ratingText, { color: evaluationResult.ratingColor }]}>
                    {evaluationResult.rating}
                  </Text>
                </View>
                <Text style={styles.evalFeedback}>{evaluationResult.feedback}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEvaluationResult(null)}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Diagnostic Metrics Chips */}
            <View style={styles.metricsRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Coverage</Text>
                <Text style={styles.metricValue}>{evaluationResult.coverageScore}%</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Spill</Text>
                <Text style={styles.metricValue}>-{evaluationResult.spillPenalty}%</Text>
              </View>
              {mode === 'blank' && evaluationResult.slopeAngle !== undefined && (
                <View style={styles.metricChip}>
                  <Text style={styles.metricLabel}>Slope</Text>
                  <Text style={styles.metricValue}>{evaluationResult.slopeAngle}°</Text>
                </View>
              )}
            </View>

            {/* Auto-Advance / Next Lesson Button if Proficient (>= 75%) */}
            {evaluationResult.score >= 75 && (
              <TouchableOpacity
                style={styles.nextLessonBtn}
                onPress={() => {
                  setEvaluationResult(null);
                  nextExercise();
                }}
              >
                <Text style={styles.nextLessonText}>🎉 Proficient! Next Exercise ➔</Text>
              </TouchableOpacity>
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
  evalCard: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 30,
  },
  evalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  evalMeta: {
    flex: 1,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  evalFeedback: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  nextLessonBtn: {
    marginTop: 12,
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLessonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
