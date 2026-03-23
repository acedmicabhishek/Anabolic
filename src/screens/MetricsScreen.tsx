import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
import { THEME } from '../constants/theme';
import { useMetrics } from '../context/MetricsContext';
import { MetricCard } from '../components/molecules/MetricCard';
import { BMIMeter } from '../components/molecules/BMIMeter';
import { BMRMeter } from '../components/molecules/BMRMeter';
import { HumanBodyModel } from '../components/organisms/HumanBodyModel';
import { ProgressGallery } from '../components/organisms/ProgressGallery';
import { Ionicons } from '@expo/vector-icons';
import { BodyMeasurementLog } from '../types/metrics';
import { GradientText } from '../components/atoms/GradientText';
import { FancyDatePicker } from '../components/molecules/FancyDatePicker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export const MetricsScreen: React.FC = () => {
  const { 
    metrics, 
    isLoading, 
    openLogModal, 
    selectedDate, 
    setSelectedDate, 
    bmi, 
    bmr, 
    setTargetWeight 
  } = useMetrics();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTargetModalVisible, setIsTargetModalVisible] = useState(false);
  const [tempTarget, setTempTarget] = useState('');

  const handleUpdateTarget = useCallback(async () => {
    await setTargetWeight(Number(tempTarget) || 0);
    setIsTargetModalVisible(false);
  }, [setTargetWeight, tempTarget]);

  const onDateChange = useCallback((event: DateTimePickerEvent, selectedDateValue?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDateValue) {
      setSelectedDate(selectedDateValue);
    }
  }, [setSelectedDate]);

  const isSameDay = useCallback((date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  }, []);

  const currentWeight = useMemo(() => metrics.weightHistory[0]?.value || '0.0', [metrics.weightHistory]);
  const currentHeight = useMemo(() => metrics.height || '0.0', [metrics.height]);

  const recentMeasurements = useMemo(() => metrics.bodyMeasurements.reduce((acc: Record<string, any>, log) => {
    if (!acc[log.part]) acc[log.part] = log;
    return acc;
  }, {} as Record<string, BodyMeasurementLog>), [metrics.bodyMeasurements]);

  const waterConsumed = useMemo(() => (metrics.waterHistory || [])
    .filter(w => isSameDay(w.date, selectedDate))
    .reduce((sum, w) => sum + w.value, 0), [metrics.waterHistory, isSameDay, selectedDate]);

  const waterTarget = metrics.waterGoal || 2500;
  const waterPerc = Math.round((waterConsumed / waterTarget) * 100);

  const calsConsumed = useMemo(() => (metrics.meals || [])
    .filter(m => isSameDay(m.date, selectedDate))
    .reduce((sum, m) => sum + m.calories, 0), [metrics.meals, isSameDay, selectedDate]);

  const calsTarget = metrics.calorieGoal || 2500;
  const calsPerc = Math.round((calsConsumed / calsTarget) * 100);

  const isSelectedToday = useMemo(() => isSameDay(selectedDate, new Date()), [isSameDay, selectedDate]);

  const handleOpenWeightModal = useCallback(() => {
    openLogModal('weight', undefined, selectedDate);
  }, [openLogModal, selectedDate]);

  const handleOpenTargetModal = useCallback(() => {
    setTempTarget((metrics.targetWeight || '').toString());
    setIsTargetModalVisible(true);
  }, [metrics.targetWeight]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading Metrics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <GradientText style={styles.title}>Metrics</GradientText>
            <TouchableOpacity 
              style={styles.dateIndicator} 
              onPress={() => setSelectedDate(new Date())}
              activeOpacity={0.7}
            >
              <Text style={styles.dateIndicatorText}>
                {isSelectedToday ? 'Today' : 
                 isSameDay(selectedDate, new Date(Date.now() - 86400000)) ? 'Yesterday' :
                 selectedDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}
              </Text>
            </TouchableOpacity>
          </View>
          <FancyDatePicker 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenCalendar={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <MetricCard 
              label={metrics.targetWeight ? "Current" : "Weight"} 
              value={currentWeight} 
              type="weight"
              iconName="scale-outline"
              onPress={handleOpenWeightModal}
            />
          </View>
          <View style={styles.halfCard}>
            <MetricCard 
              label="Target" 
              value={metrics.targetWeight || '--'} 
              type="weight"
              iconName="flag-outline"
              onPress={handleOpenTargetModal}
            />
          </View>
        </View>

        <MetricCard 
          label="Height" 
          value={currentHeight} 
          type="height"
          iconName="resize-outline"
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="stats-chart" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Daily Targets</Text>
          </View>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressIconWrapperCal}>
              <Ionicons name="flame" size={20} color="#f59e0b" />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Calories</Text>
              <Text style={styles.progressValue}>
                {calsConsumed} / {calsTarget} <Text style={styles.progressUnit}>kcal</Text>
              </Text>
            </View>
            <View style={[styles.progressBadgeWrap, calsPerc > 100 && styles.progressExceededWrap]}>
              <Text style={[styles.progressBadge, calsPerc > 100 && styles.progressExceeded]}>
                {calsPerc}%
              </Text>
            </View>
          </View>
          
          <View style={styles.progressDivider} />
          
          <View style={styles.progressRow}>
            <View style={styles.progressIconWrapperWater}>
              <Ionicons name="water" size={20} color="#3b82f6" />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Water</Text>
              <Text style={styles.progressValue}>
                {waterConsumed} / {waterTarget} <Text style={styles.progressUnit}>{metrics.preferences.fluid}</Text>
              </Text>
            </View>
            <View style={[styles.progressBadgeWrap, waterPerc > 100 && styles.progressExceededWrap]}>
              <Text style={[styles.progressBadge, waterPerc > 100 && styles.progressExceeded]}>
                {waterPerc}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="body" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Anatomy Tracking</Text>
          </View>
          <TouchableOpacity onPress={() => openLogModal('body', undefined, selectedDate)} style={styles.logPartBtn}>
            <Ionicons name="add-circle-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.linkText}>Log Part</Text>
          </TouchableOpacity>
        </View>

        <HumanBodyModel measurements={metrics.bodyMeasurements} />
        
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Recent Progress</Text>
          </View>
        </View>

        {Object.values(recentMeasurements).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={40} color={THEME.colors.surfaceSecondary} />
            <Text style={styles.emptyText}>No logs for this date yet.</Text>
          </View>
        ) : (
          Object.values(recentMeasurements).map((log) => (
            <MetricCard 
              key={log.id}
              label={log.part.toUpperCase()} 
              value={log.value} 
              type="body" 
              iconName="compass-outline"
              onPress={() => openLogModal('body', log.part, selectedDate)}
            />
          ))
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="pulse" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Personal Physiology</Text>
          </View>
        </View>
        <BMIMeter value={bmi} />
        <BMRMeter value={bmr} />

        <ProgressGallery />

        <Modal
          visible={isTargetModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsTargetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Target</Text>
              <Text style={styles.modalSub}>{metrics.preferences.weight.toUpperCase()}</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={tempTarget}
                onChangeText={setTempTarget}
                autoFocus
                placeholder="0.0"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
              <View style={styles.modalRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsTargetModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleUpdateTarget}>
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  loadingText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 18,
  },
  header: {
    marginBottom: THEME.spacing.xl,
    marginTop: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.typography.black,
    fontSize: 28,
    color: THEME.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  dateIndicator: {
    backgroundColor: 'rgba(141, 224, 166, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(141, 224, 166, 0.2)',
  },
  dateIndicatorText: {
    fontFamily: THEME.typography.bold,
    fontSize: 12,
    color: THEME.colors.primary,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: THEME.typography.bold,
    fontSize: 18,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  emptyContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.roundness.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyText: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textMuted,
    fontSize: 14,
    marginTop: THEME.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.xl,
    marginBottom: THEME.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  logPartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(141, 224, 166, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  linkText: {
    color: THEME.colors.primary,
    fontFamily: THEME.typography.bold,
    fontSize: 12,
  },
  progressCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIconWrapperCal: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245, 158, 11, 0.15)', justifyContent: 'center', alignItems: 'center'
  },
  progressIconWrapperWater: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.15)', justifyContent: 'center', alignItems: 'center'
  },
  progressInfo: {
    flex: 1, marginLeft: THEME.spacing.md
  },
  progressLabel: {
    fontFamily: THEME.typography.bold, color: THEME.colors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4
  },
  progressValue: {
    fontFamily: THEME.typography.black, color: THEME.colors.text, fontSize: 16
  },
  progressUnit: {
    fontFamily: THEME.typography.semiBold, color: THEME.colors.textMuted, fontSize: 12
  },
  progressBadgeWrap: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
  },
  progressExceededWrap: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  progressBadge: {
    fontFamily: THEME.typography.black, color: THEME.colors.primary, fontSize: 12
  },
  progressExceeded: {
    color: '#ef4444' 
  },
  progressDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: THEME.spacing.md
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    padding: 30,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 24,
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 12,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: THEME.colors.surfaceSecondary,
    width: '100%',
    padding: 10,
    borderRadius: 16,
    color: THEME.colors.text,
    fontSize: 32,
    fontFamily: THEME.typography.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: THEME.typography.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
  },
});
