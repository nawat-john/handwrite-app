import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ToolButton } from './ToolButton';
import { usePracticeStore } from '../../store/usePracticeStore';
import { STROKE_WIDTH_OPTIONS } from '../../types/canvas';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  onEvaluate?: () => void;
  onOpenCurriculum?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = 'CursiveCraft',
  subtitle = 'iPad Penmanship Practice',
  onEvaluate,
  onOpenCurriculum,
}) => {
  const {
    strokes,
    strokeWidth,
    setStrokeWidth,
    undo,
    clearCanvas,
    palmRejectionEnabled,
    togglePalmRejection,
    mode,
    setMode,
    isEvaluating,
    currentExercise,
    nextExercise,
    prevExercise,
    selectedCategory,
  } = usePracticeStore();

  const canUndo = strokes.length > 0;
  const canClear = strokes.length > 0;

  return (
    <View style={styles.header}>
      {/* App Branding & Lesson Stepper */}
      <View style={styles.leftSection}>
        <View style={styles.brandRow}>
          <Text style={styles.appTitle}>{title}</Text>
          <Text style={styles.appSubtitle}>{subtitle}</Text>
        </View>

        {/* Curriculum Lesson Picker & Stepper */}
        <View style={styles.lessonControlRow}>
          {onOpenCurriculum && (
            <ToolButton
              label={`📚 ${selectedCategory.toUpperCase()}: ${currentExercise.text.slice(0, 14)}${currentExercise.text.length > 14 ? '...' : ''}`}
              onPress={onOpenCurriculum}
              style={styles.curriculumButton}
              textStyle={styles.curriculumText}
            />
          )}

          <View style={styles.stepperGroup}>
            <ToolButton label="◀" onPress={prevExercise} style={styles.stepperBtn} />
            <ToolButton label="▶" onPress={nextExercise} style={styles.stepperBtn} />
          </View>
        </View>
      </View>

      {/* Center Controls: Mode, Stroke Width & Palm Rejection */}
      <View style={styles.centerSection}>
        {/* Practice Mode Switcher */}
        <View style={styles.groupContainer}>
          <ToolButton
            label="✍️ Trace"
            isActive={mode === 'trace'}
            onPress={() => setMode('trace')}
            style={styles.pillButton}
          />
          <ToolButton
            label="📝 Blank"
            isActive={mode === 'blank'}
            onPress={() => setMode('blank')}
            style={styles.pillButton}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.groupContainer}>
          <Text style={styles.groupLabel}>Width:</Text>
          {STROKE_WIDTH_OPTIONS.map((opt) => (
            <ToolButton
              key={opt.id}
              label={opt.label.split(' ')[0]} // Fine / Standard / Bold
              isActive={strokeWidth === opt.value}
              onPress={() => setStrokeWidth(opt.value)}
              style={styles.pillButton}
            />
          ))}
        </View>

        <View style={styles.separator} />

        <ToolButton
          label={palmRejectionEnabled ? '✏️ Apple Pencil' : '🖐️ Touch'}
          isActive={palmRejectionEnabled}
          onPress={togglePalmRejection}
          style={styles.palmButton}
        />
      </View>

      {/* Right Controls: Evaluate, Undo & Clear */}
      <View style={styles.rightSection}>
        {onEvaluate && (
          <ToolButton
            label={isEvaluating ? '⏳ Checking...' : '🎯 Check'}
            disabled={!canUndo || isEvaluating}
            variant="primary"
            onPress={onEvaluate}
          />
        )}
        <ToolButton
          label={`↩ Undo (${strokes.length})`}
          disabled={!canUndo}
          onPress={undo}
        />
        <ToolButton
          label="🗑 Clear"
          disabled={!canClear}
          variant="danger"
          onPress={clearCanvas}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  lessonControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  curriculumButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  curriculumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stepperBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 28,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 2,
  },
  pillButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  palmButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
