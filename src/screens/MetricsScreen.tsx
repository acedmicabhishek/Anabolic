import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { THEME } from '../constants/theme';
import { useMetrics } from '../context/MetricsContext';
import { MetricCard } from '../components/molecules/MetricCard';
import { BMIMeter } from '../components/molecules/BMIMeter';
import { BMRMeter } from '../components/molecules/BMRMeter';
import { HumanBodyModel } from '../components/organisms/HumanBodyModel';
import { ProgressGallery } from '../components/organisms/ProgressGallery';
import { Ionicons } from '@expo/vector-icons';
import { BodyMeasurementLog, BodyMeasurementMap } from '../types/metrics';

export const MetricsScreen: React.FC = () => {
  const { metrics, isLoading, openLogModal, bmi, bmr } = useMetrics();

  const currentWeight = metrics.weightHistory[0]?.value || '0.0';
  const previousWeight = metrics.weightHistory[1]?.value;
  const currentHeight = metrics.height || '0.0';

  
  const recentMeasurements = metrics.bodyMeasurements.reduce((acc: Record<string, any>, log) => {
    if (!acc[log.part]) acc[log.part] = log;
    return acc;
  }, {} as Record<string, BodyMeasurementLog>);

  const waterConsumed = metrics.currentWater || 0;
  const waterTarget = metrics.waterGoal || 2500;
  const waterPerc = Math.round((waterConsumed / waterTarget) * 100);

  const calsConsumed = metrics.calories || 0;
  const calsTarget = metrics.calorieGoal || 2500;
  const calsPerc = Math.round((calsConsumed / calsTarget) * 100);

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
          <View>
            <Text style={styles.title}>Metrics</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <MetricCard 
              label="Weight" 
              value={currentWeight} 
              type="weight"
            />
          </View>
          <View style={styles.halfCard}>
            <MetricCard 
              label="Height" 
              value={currentHeight} 
              type="height"
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>
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
          <Text style={styles.sectionTitle}>Health Profile</Text>
        </View>
        
        <BMIMeter value={bmi} />
        <BMRMeter value={bmr} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anatomy Log</Text>
          <TouchableOpacity onPress={() => openLogModal('body')}>
            <Text style={styles.linkText}>+ Log Part</Text>
          </TouchableOpacity>
        </View>

        <HumanBodyModel measurements={metrics.bodyMeasurements} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
        </View>

        {Object.values(recentMeasurements).length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No measurements logged yet.</Text>
          </View>
        ) : (
          Object.values(recentMeasurements).map((log) => (
            <MetricCard 
              key={log.id}
              label={log.part.toUpperCase()} 
              value={log.value} 
              type="body" 
            />
          ))
        )}

        <ProgressGallery />
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
    fontSize: 36,
    color: THEME.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: THEME.typography.semiBold,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
  },
  subtitle: {
    fontFamily: THEME.typography.medium,
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: THEME.typography.bold,
    fontSize: 20,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.roundness.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyText: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.textMuted,
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  addBtnSmall: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    fontFamily: THEME.typography.bold,
    fontSize: 12,
    color: THEME.colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.xl,
    marginBottom: THEME.spacing.md,
  },
  linkText: {
    color: THEME.colors.primary,
    fontFamily: THEME.typography.bold,
    fontSize: 14,
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
    fontFamily: THEME.typography.black, color: THEME.colors.text, fontSize: 18
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
    fontFamily: THEME.typography.black, color: THEME.colors.primary, fontSize: 14
  },
  progressExceeded: {
    color: '#ef4444' 
  },
  progressDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: THEME.spacing.md
  }
});
