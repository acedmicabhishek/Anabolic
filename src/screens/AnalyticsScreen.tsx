import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useMetrics } from '../context/MetricsContext';
import { ChartWidget } from '../components/organisms/ChartWidget';
import { BODY_PARTS } from '../types/metrics';
import { GradientText } from '../components/atoms/GradientText';

export const AnalyticsScreen: React.FC = () => {
  const { metrics, isLoading } = useMetrics();
  const [filter, setFilter] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
  
  const coreVitals = useMemo(() => ['Weight', 'Calories', 'Water', 'Height'], []);
  const [activeVital, setActiveVital] = useState<string>('Weight');
  const [activeBodyParts, setActiveBodyParts] = useState<string[]>(['Biceps', 'Waist']);

  const toggleBodyPart = useCallback((b: string) => {
    setActiveBodyParts(prev => {
      if (prev.includes(b)) {
        return prev.length > 1 ? prev.filter(x => x !== b) : prev;
      } else {
        return [...prev, b];
      }
    });
  }, []);

  const days = useMemo(() => filter === 'WEEK' ? 7 : filter === 'MONTH' ? 30 : 365, [filter]);
  
  const dateLabels = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [days]);
  
  const chartLabels = useMemo(() => dateLabels.map((dStr, index) => {
    const isFirst = index === 0;
    const isLast = index === dateLabels.length - 1;
    const isMiddle = index === Math.floor(dateLabels.length / 2);
    
    if (isFirst || isLast || isMiddle) {
      const d = new Date(dStr);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    return '';
  }), [dateLabels]);

  const getContinuousHistory = useCallback((historyArr: {date: string, value: number}[]) => {
    if (!historyArr || historyArr.length === 0) return dateLabels.map(() => 0);
    const sorted = [...historyArr].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let lastKnown = sorted[0].value;
    
    return dateLabels.map(dStr => {
      const dayLogs = sorted.filter(l => l.date.includes(dStr));
      if (dayLogs.length > 0) {
        lastKnown = dayLogs[dayLogs.length - 1].value;
      }
      return lastKnown;
    });
  }, [dateLabels]);

  const getContinuousSum = useCallback((mealsArr: {date: string, calories: number}[]) => {
    if (!mealsArr) return dateLabels.map(() => 0);
    return dateLabels.map(dStr => {
      return mealsArr.filter(m => m.date.includes(dStr)).reduce((sum, m) => sum + m.calories, 0);
    });
  }, [dateLabels]);

  const rawWeight = useMemo(() => getContinuousHistory(metrics.weightHistory || []), [getContinuousHistory, metrics.weightHistory]);
  const rawHeight = useMemo(() => getContinuousHistory(metrics.heightHistory || []), [getContinuousHistory, metrics.heightHistory]);
  const rawWater = useMemo(() => getContinuousHistory(metrics.waterHistory || []), [getContinuousHistory, metrics.waterHistory]);
  const rawCalories = useMemo(() => getContinuousSum(metrics.meals || []), [getContinuousSum, metrics.meals]);

  const colorMap: Record<string, string> = useMemo(() => ({
    'Weight': THEME.colors.primary,
    'Calories': '#f59e0b', 
    'Water': '#3b82f6', 
    'Height': '#ec4899', 
  }), []);

  const vitalRaw = useMemo(() => {
    if (activeVital === 'Weight') return rawWeight;
    if (activeVital === 'Calories') return rawCalories;
    if (activeVital === 'Water') return rawWater;
    if (activeVital === 'Height') return rawHeight;
    return [0];
  }, [activeVital, rawWeight, rawCalories, rawWater, rawHeight]);

  const vitalUnit = useMemo(() => {
    if (activeVital === 'Weight') return metrics.preferences.weight;
    if (activeVital === 'Calories') return 'kcal';
    if (activeVital === 'Water') return metrics.preferences.fluid;
    if (activeVital === 'Height') return metrics.preferences.height;
    return '';
  }, [activeVital, metrics.preferences]);

  const singleVitalDataset = useMemo(() => [{
    name: activeVital,
    color: colorMap[activeVital] || THEME.colors.primary,
    data: vitalRaw && vitalRaw.length > 0 ? vitalRaw : [0]
  }], [activeVital, colorMap, vitalRaw]);

  const bodyDatasets = useMemo(() => activeBodyParts.map((bp, i) => {
    const hue = (i * 137.5) % 360; 
    const c = `hsl(${hue}, 70%, 50%)`;
    
    const logs = (metrics.bodyMeasurements || []).filter(m => m.part === bp);
    return {
      name: bp,
      color: c,
      data: getContinuousHistory(logs)
    };
  }), [activeBodyParts, metrics.bodyMeasurements, getContinuousHistory]);

  const currentWeight = useMemo(() => metrics.weightHistory && metrics.weightHistory.length > 0 ? metrics.weightHistory[0].value : 0, [metrics.weightHistory]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading Trends...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="flash" size={24} color={THEME.colors.primary} />
            <GradientText style={styles.title}>Analytics</GradientText>
          </View>
        </View>

        <View style={styles.segmentControl}>
          {['WEEK', 'MONTH', 'YEAR'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.segmentBtn, filter === f && styles.segmentBtnActive]}
              onPress={() => setFilter(f as 'WEEK' | 'MONTH' | 'YEAR')}
            >
              <Text style={[styles.segmentText, filter === f && styles.segmentTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={20} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Health Vitals Tracking</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {coreVitals.map(v => {
            const isActive = activeVital === v;
            return (
              <TouchableOpacity
                key={v}
                style={[styles.pillBtn, isActive && { backgroundColor: colorMap[v], borderColor: colorMap[v] }]}
                onPress={() => setActiveVital(v)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{v}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.chartWrapper}>
          <ChartWidget
            labels={chartLabels}
            datasets={singleVitalDataset}
            unit={vitalUnit}
            hideTitle
          />
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="body" size={20} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Body Composition (Raw)</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {BODY_PARTS.map(bp => {
            const isActive = activeBodyParts.includes(bp);
            return (
              <TouchableOpacity
                key={bp}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => toggleBodyPart(bp)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{bp}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.chartWrapper}>
          <ChartWidget
            labels={chartLabels}
            datasets={bodyDatasets}
            unit={metrics.preferences.body}
            hideTitle
          />
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="bulb" size={20} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Current Baselines</Text>
        </View>
        <View style={styles.insightsRow}>
          <TouchableOpacity 
            style={styles.insightCard}
            onPress={() => setActiveVital('Weight')}
          >
            <View style={styles.insightHeader}>
              <Ionicons name="scale-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.insightLabel}>Current</Text>
            </View>
            <Text style={styles.insightValue}>{currentWeight} <Text style={styles.insightUnit}>{metrics.preferences.weight}</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.insightCard}
            onPress={() => setActiveVital('Weight')}
          >
            <View style={styles.insightHeader}>
              <Ionicons name="flag-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.insightLabel}>Target</Text>
            </View>
            <Text style={styles.insightValue}>{metrics.targetWeight || '--'} <Text style={styles.insightUnit}>{metrics.preferences.weight}</Text></Text>
          </TouchableOpacity>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="list-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.insightLabel}>Logs</Text>
            </View>
            <Text style={styles.insightValue}>{metrics.weightHistory?.length || 0} <Text style={styles.insightUnit}>Entries</Text></Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: THEME.spacing.lg, paddingBottom: 100 },
  loadingText: { fontFamily: THEME.typography.bold, color: THEME.colors.primary, fontSize: 18 },
  header: {
    marginBottom: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  title: { fontFamily: THEME.typography.black, fontSize: 28, color: THEME.colors.text, marginBottom: THEME.spacing.sm },
  segmentControl: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: THEME.spacing.xl, gap: 12 },
  segmentBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: THEME.colors.surfaceSecondary },
  segmentBtnActive: { backgroundColor: THEME.colors.primary },
  segmentText: { fontFamily: THEME.typography.bold, color: THEME.colors.textSecondary, fontSize: 11 },
  segmentTextActive: { color: THEME.colors.background },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontFamily: THEME.typography.black,
    fontSize: 18,
    color: THEME.colors.text,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  pillsScroll: { paddingBottom: THEME.spacing.lg, gap: 10 },
  pillBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: THEME.colors.surfaceSecondary, backgroundColor: THEME.colors.surface },
  pillBtnActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  pillText: { fontFamily: THEME.typography.bold, color: THEME.colors.textSecondary, fontSize: 12 },
  pillTextActive: { color: THEME.colors.background },
  
  chartWrapper: { alignItems: 'center', marginBottom: THEME.spacing.xxl, width: '100%' },
  
  insightsRow: { flexDirection: 'row', gap: THEME.spacing.md },
  insightCard: { flex: 1, backgroundColor: THEME.colors.surface, padding: THEME.spacing.md, borderRadius: THEME.roundness.md },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  insightLabel: { fontFamily: THEME.typography.semiBold, color: THEME.colors.textSecondary, fontSize: 11, textTransform: 'uppercase' },
  insightValue: { fontFamily: THEME.typography.black, color: THEME.colors.text, fontSize: 18 },
  insightUnit: { fontFamily: THEME.typography.semiBold, fontSize: 10, color: THEME.colors.textSecondary },
});
