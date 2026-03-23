import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { CalorieTracker } from '../components/molecules/CalorieTracker';
import { useMetrics } from '../context/MetricsContext';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScannerOverlay } from '../components/organisms/BarcodeScannerOverlay';
import { GradientText } from '../components/atoms/GradientText';
import { FancyDatePicker } from '../components/molecules/FancyDatePicker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const MEALS = [
  { name: 'Breakfast', icon: 'sunny' },
  { name: 'Lunch', icon: 'partly-sunny' },
  { name: 'Dinner', icon: 'moon' },
  { name: 'Snacks', icon: 'nutrition' },
] as const;

export const DietScreen: React.FC = () => {
  const { metrics, openLogModal, selectedDate, setSelectedDate } = useMetrics();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannerMeal, setScannerMeal] = useState('Snacks');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = useCallback((event: DateTimePickerEvent, selectedDateValue?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDateValue) {
      setSelectedDate(selectedDateValue);
    }
  }, [setSelectedDate]);

  const openScanner = useCallback((mealName: string) => {
    setScannerMeal(mealName);
    setScannerVisible(true);
  }, []);

  const isSameDay = useCallback((date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  }, []);

  const caloriesForDay = useMemo(() => (metrics.meals || [])
    .filter(m => isSameDay(m.date, selectedDate))
    .reduce((sum, m) => sum + m.calories, 0), [metrics.meals, isSameDay, selectedDate]);

  const waterForDay = useMemo(() => (metrics.waterHistory || [])
    .filter(w => isSameDay(w.date, selectedDate))
    .reduce((sum, w) => sum + w.value, 0), [metrics.waterHistory, isSameDay, selectedDate]);

  const getCaloriesForMeal = useCallback((mealName: string) => {
    return (metrics.meals || [])
      .filter((m) => m.name === mealName && isSameDay(m.date, selectedDate))
      .reduce((sum, m) => sum + m.calories, 0);
  }, [metrics.meals, isSameDay, selectedDate]);

  const isSelectedToday = useMemo(() => isSameDay(selectedDate, new Date()), [isSameDay, selectedDate]);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="flash" size={24} color={THEME.colors.primary} />
            <GradientText style={styles.title}>Diet</GradientText>
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

        <CalorieTracker 
          date={selectedDate}
          current={caloriesForDay}
          goal={metrics.calorieGoal}
          waterCurrent={waterForDay}
          waterGoal={metrics.waterGoal}
          onCenterPress={() => openScanner('Snacks')} 
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openLogModal('calories', undefined, selectedDate)}
          >
            <Ionicons name="fast-food" size={24} color={THEME.colors.primary} />
            <Text style={styles.actionButtonText}>Quick Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openLogModal('water', undefined, selectedDate)}
          >
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Log Water</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="nutrition" size={20} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Today's Meals</Text>
        </View>
        <View style={styles.mealsContainer}>
          {MEALS.map((meal) => (
            <View key={meal.name} style={styles.mealCard}>
              <View style={styles.mealIconBox}>
                <Ionicons name={meal.icon as any} size={24} color={THEME.colors.primary} />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{getCaloriesForMeal(meal.name)} kcal</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: THEME.spacing.sm }}>
                <TouchableOpacity style={styles.mealScanBtn} onPress={() => openScanner(meal.name)}>
                  <Ionicons name="barcode-outline" size={20} color={THEME.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mealAddBtn} onPress={() => openLogModal('calories', meal.name, selectedDate)}>
                  <Ionicons name="add" size={24} color={THEME.colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BarcodeScannerOverlay
        visible={isScannerVisible}
        onClose={() => setScannerVisible(false)}
        targetMeal={scannerMeal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingTop: 50,
  },
  header: {
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: 28,
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    letterSpacing: -0.5,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  mealsContainer: {
    gap: THEME.spacing.md,
  },
  mealCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  mealIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color: THEME.colors.text,
    fontFamily: THEME.typography.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  mealCalories: {
    color: THEME.colors.textSecondary,
    fontFamily: THEME.typography.semiBold,
    fontSize: 14,
  },
  mealScanBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  mealAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionButtonText: {
    color: THEME.colors.text,
    fontFamily: THEME.typography.bold,
    fontSize: 14,
  },
});
