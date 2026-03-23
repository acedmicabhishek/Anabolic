import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { CalorieTracker } from '../components/molecules/CalorieTracker';
import { useMetrics } from '../context/MetricsContext';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScannerOverlay } from '../components/organisms/BarcodeScannerOverlay';

const MEALS = [
  { name: 'Breakfast', icon: 'sunny' },
  { name: 'Lunch', icon: 'partly-sunny' },
  { name: 'Dinner', icon: 'moon' },
  { name: 'Snacks', icon: 'nutrition' },
] as const;

export const DietScreen: React.FC = () => {
  const { metrics, openLogModal } = useMetrics();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannerMeal, setScannerMeal] = useState('Snacks');

  const openScanner = (mealName: string) => {
    setScannerMeal(mealName);
    setScannerVisible(true);
  };

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const getCaloriesForMeal = (mealName: string) => {
    return (metrics.meals || [])
      .filter((m) => m.name === mealName && isToday(m.date))
      .reduce((sum, m) => sum + m.calories, 0);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <View style={styles.header}>
          <Text style={styles.title}>Diet</Text>
          <Text style={styles.subtitle}>Fuel your potential</Text>
        </View> */}

        <CalorieTracker onCenterPress={() => openScanner('Snacks')} />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openLogModal('calories')}
          >
            <Ionicons name="fast-food" size={24} color={THEME.colors.primary} />
            <Text style={styles.actionButtonText}>Quick Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openLogModal('water')}
          >
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Log Water</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Today's Meals</Text>
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
                <TouchableOpacity style={styles.mealAddBtn} onPress={() => openLogModal('calories', meal.name)}>
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
    paddingTop: 60, 
  },
  header: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.text,
    letterSpacing: 1,
    marginBottom: THEME.spacing.md,
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
