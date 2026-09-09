import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { CATEGORY_METAS } from '../../types/curriculum';
import type { ExerciseCategory, ExerciseItem } from '../../types/curriculum';
import { getExercisesByCategory } from '../../data/exercises';
import { usePracticeStore } from '../../store/usePracticeStore';
import { useHistoryStore } from '../../store/useHistoryStore';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    selectedCategory,
    currentExercise,
    selectCategory,
    selectExercise,
    completedExerciseIds,
  } = usePracticeStore();

  const bestScores = useHistoryStore((s) => s.bestScores);

  const exercises = getExercisesByCategory(selectedCategory);

  const handleSelect = (ex: ExerciseItem) => {
    selectExercise(ex);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Penmanship Curriculum</Text>
              <Text style={styles.subtitle}>
                Choose a lesson category and select an exercise to practice
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsRow}>
            {CATEGORY_METAS.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => selectCategory(cat.id)}
                >
                  <Text style={styles.tabIcon}>{cat.icon}</Text>
                  <View>
                    <Text style={[styles.tabTitle, isActive && styles.activeTabTitle]}>
                      Level {cat.level}: {cat.title}
                    </Text>
                    <Text style={styles.tabCount}>{cat.totalCount} lessons</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Exercise Grid / List */}
          <ScrollView contentContainerStyle={styles.listContent}>
            <View style={styles.grid}>
              {exercises.map((ex, idx) => {
                const isCurrent = currentExercise.id === ex.id;
                const isCompleted = completedExerciseIds.includes(ex.id);
                const bestScore = bestScores[ex.id];

                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[
                      styles.card,
                      isCurrent && styles.activeCard,
                      isCompleted && styles.completedCard,
                    ]}
                    onPress={() => handleSelect(ex)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIndex}>#{idx + 1}</Text>
                      <View style={styles.headerBadges}>
                        {bestScore !== undefined && bestScore > 0 && (
                          <View
                            style={[
                              styles.scoreBadge,
                              bestScore >= 75 ? styles.scoreBadgeHigh : styles.scoreBadgeLow,
                            ]}
                          >
                            <Text
                              style={[
                                styles.scoreBadgeText,
                                bestScore >= 75 ? styles.scoreBadgeTextHigh : styles.scoreBadgeTextLow,
                              ]}
                            >
                              ★ {bestScore}%
                            </Text>
                          </View>
                        )}
                        {isCompleted && (
                          <View style={styles.checkBadge}>
                            <Text style={styles.checkText}>✓ Done</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.cursivePreview,
                        ex.category === 'sentence' && styles.sentencePreview,
                      ]}
                      numberOfLines={2}
                    >
                      {ex.text}
                    </Text>

                    {ex.subText && (
                      <Text style={styles.cardSubText} numberOfLines={1}>
                        {ex.subText}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  container: {
    width: '90%',
    maxWidth: 960,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  activeTab: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  activeTabTitle: {
    color: '#0284C7',
  },
  tabCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  listContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '23.5%',
    minWidth: 180,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  activeCard: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  completedCard: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreBadgeHigh: {
    backgroundColor: '#DCFCE7',
  },
  scoreBadgeLow: {
    backgroundColor: '#FEF3C7',
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scoreBadgeTextHigh: {
    color: '#16A34A',
  },
  scoreBadgeTextLow: {
    color: '#D97706',
  },
  checkBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  checkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  cursivePreview: {
    fontFamily: 'LearningCurvePro',
    fontSize: 24,
    color: '#0F172A',
    marginVertical: 4,
  },
  sentencePreview: {
    fontSize: 18,
  },
  cardSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
});
