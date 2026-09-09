import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { EvaluationResult } from '../../engine/imageEvaluator';

interface ScoreModalProps {
  visible: boolean;
  result: EvaluationResult | null;
  exerciseText: string;
  onClose: () => void;
  onTryAgain: () => void;
  onNextExercise: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  visible,
  result,
  exerciseText,
  onClose,
  onTryAgain,
  onNextExercise,
}) => {
  if (!result) return null;

  const { score, rating, ratingColor, coverageScore, spillPenalty, slopePenalty, feedback } = result;
  const precisionScore = Math.max(0, Math.round((100 - spillPenalty) * 10) / 10);
  const baselineAdherence = Math.max(0, Math.round((100 - slopePenalty) * 10) / 10);

  // Build Skia circular arc paths for the score ring
  const ringSize = 130;
  const strokeWidth = 10;
  const inset = strokeWidth / 2 + 4;
  const oval = {
    x: inset,
    y: inset,
    width: ringSize - inset * 2,
    height: ringSize - inset * 2,
  };

  const bgPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(oval, 0, 360);
    return p;
  }, [oval.x, oval.y, oval.width, oval.height]);

  const progressPath = useMemo(() => {
    const p = Skia.Path.Make();
    const sweep = Math.max(2, (score / 100) * 360);
    p.addArc(oval, -90, sweep);
    return p;
  }, [oval.x, oval.y, oval.width, oval.height, score]);

  // Contextual Penmanship Coaching in Thai and English
  const coachingAdvice = useMemo(() => {
    const adviceList: string[] = [];

    if (coverageScore < 70) {
      adviceList.push('พยายามลากเส้นเชื่อม (Ligature) และห่วงของตัวอักษร เช่น e, l, h ให้สมบูรณ์');
    }
    if (spillPenalty > 20) {
      adviceList.push('ระวังการตวัดปากกาออกนอกเส้นโครงร่าง พยายามคุมความเร็วให้คงที่');
    }
    if (slopePenalty > 15) {
      adviceList.push('ลายมือเริ่มเอียงหลุดแนว ให้วางฐานตัวอักษรชิดเส้น Base Line อย่างสม่ำเสมอ');
    }
    if (adviceList.length === 0) {
      adviceList.push('จังหวะการตวัดเส้นและสัดส่วนตัวเขียนสวยงามกลมกลืนตามมาตรฐานสากล');
    }

    return adviceList[0];
  }, [coverageScore, spillPenalty, slopePenalty]);

  const isProficient = score >= 75;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close X */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Penmanship Evaluation</Text>
            <Text style={styles.exerciseTitle} numberOfLines={1}>
              &ldquo;{exerciseText}&rdquo;
            </Text>
          </View>

          {/* Circular Score Ring & Grade */}
          <View style={styles.scoreSection}>
            <View style={styles.ringWrapper}>
              <Canvas style={{ width: ringSize, height: ringSize }}>
                <Path
                  path={bgPath}
                  color="#E2E8F0"
                  style="stroke"
                  strokeWidth={strokeWidth}
                  strokeCap="round"
                />
                <Path
                  path={progressPath}
                  color={ratingColor}
                  style="stroke"
                  strokeWidth={strokeWidth}
                  strokeCap="round"
                />
              </Canvas>
              <View style={styles.ringCenterText}>
                <Text style={[styles.scoreNumber, { color: ratingColor }]}>{score}</Text>
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>

            <View style={styles.gradeContainer}>
              <View style={[styles.gradeBadge, { backgroundColor: ratingColor + '20' }]}>
                <Text style={[styles.gradeText, { color: ratingColor }]}>{rating}</Text>
              </View>
              <Text style={styles.summaryFeedback}>{feedback}</Text>
            </View>
          </View>

          {/* Granular Metric Breakdown Bars */}
          <View style={styles.metricsContainer}>
            {/* Coverage Bar */}
            <View style={styles.metricRow}>
              <View style={styles.metricLabels}>
                <Text style={styles.metricTitle}>Coverage Accuracy ($S_{`cov`}$)</Text>
                <Text style={styles.metricPercent}>{coverageScore}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${coverageScore}%`, backgroundColor: '#0EA5E9' }]} />
              </View>
            </View>

            {/* Precision & Spill Bar */}
            <View style={styles.metricRow}>
              <View style={styles.metricLabels}>
                <Text style={styles.metricTitle}>Precision & Cleanliness</Text>
                <Text style={styles.metricPercent}>{precisionScore}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${precisionScore}%`, backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* Baseline Adherence Bar */}
            {slopePenalty > 0 && (
              <View style={styles.metricRow}>
                <View style={styles.metricLabels}>
                  <Text style={styles.metricTitle}>Baseline Adherence</Text>
                  <Text style={styles.metricPercent}>{baselineAdherence}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${baselineAdherence}%`, backgroundColor: '#8B5CF6' }]} />
                </View>
              </View>
            )}
          </View>

          {/* Penmanship Coach Tip */}
          <View style={styles.coachBox}>
            <Text style={styles.coachIcon}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.coachTitle}>คำแนะนำสำหรับการฝึกฝน (Coaching Tip):</Text>
              <Text style={styles.coachText}>{coachingAdvice}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.tryAgainBtn} onPress={onTryAgain}>
              <Text style={styles.tryAgainText}>🔄 ลองอีกครั้ง (Try Again)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextLessonBtn, isProficient && styles.nextLessonBtnActive]}
              onPress={onNextExercise}
            >
              <Text style={styles.nextLessonText}>
                {isProficient ? '🎉 บทเรียนถัดไป (Next Lesson) ➔' : 'บทเรียนถัดไป (Skip to Next) ➔'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '90%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  exerciseTitle: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  ringWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringCenterText: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  percentSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 2,
  },
  gradeContainer: {
    flex: 1,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryFeedback: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  metricsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  metricRow: {
    gap: 6,
  },
  metricLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  metricPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  coachBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  coachIcon: {
    fontSize: 18,
  },
  coachTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  coachText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tryAgainBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tryAgainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  nextLessonBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLessonBtnActive: {
    backgroundColor: '#10B981',
  },
  nextLessonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
