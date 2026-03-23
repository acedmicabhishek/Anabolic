import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

interface BMIMeterProps {
  value: string | number;
}

export const BMIMeter: React.FC<BMIMeterProps> = ({ value }) => {
  const bmi = typeof value === 'string' ? parseFloat(value) : value;
  
  const getCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: '#60a5fa' }; 
    if (val < 25) return { label: 'Healthy', color: '#34d399' }; 
    if (val < 30) return { label: 'Overweight', color: '#fbbf24' }; 
    return { label: 'Obese', color: '#ef4444' }; 
  };

  const category = getCategory(bmi);
  
  
  const min = 10;
  const max = 40;
  const clampedBmi = Math.min(Math.max(bmi, min), max);
  const position = ((clampedBmi - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          <Text style={styles.bmiLabel}>Current BMI</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: category.color + '20' }]}>
          <Text style={[styles.badgeText, { color: category.color }]}>{category.label}</Text>
        </View>
      </View>

      <View style={styles.meterContainer}>
        <View style={styles.track}>
          <View style={[styles.segment, { flex: 8.5, backgroundColor: '#60a5fa', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
          <View style={[styles.segment, { flex: 6.5, backgroundColor: '#34d399' }]} />
          <View style={[styles.segment, { flex: 5, backgroundColor: '#fbbf24' }]} />
          <View style={[styles.segment, { flex: 10, backgroundColor: '#ef4444', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
        </View>
        
        <View style={[styles.pointer, { left: `${position}%` }]}>
          <View style={styles.pointerDot} />
          <View style={styles.pointerLine} />
        </View>
      </View>

      <View style={styles.labels}>
        <View style={[styles.labelGroup, { left: `${getLabelPos(18.5)}%` }]}><Text style={styles.label}>18.5</Text></View>
        <View style={[styles.labelGroup, { left: `${getLabelPos(25)}%` }]}><Text style={styles.label}>25</Text></View>
        <View style={[styles.labelGroup, { left: `${getLabelPos(30)}%` }]}><Text style={styles.label}>30</Text></View>
      </View>
    </View>
  );
};


const getLabelPos = (val: number) => {
  const min = 10;
  const max = 40;
  return ((val - min) / (max - min)) * 100;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.roundness.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  bmiValue: {
    fontFamily: THEME.typography.black,
    fontSize: 28,
    color: THEME.colors.text,
  },
  bmiLabel: {
    fontFamily: THEME.typography.semiBold,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: THEME.typography.black,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  meterContainer: {
    height: 30, 
    justifyContent: 'flex-end',
    position: 'relative',
  },
  track: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  pointer: {
    position: 'absolute',
    bottom: -4,
    alignItems: 'center',
    width: 20,
    marginLeft: -10,
  },
  pointerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.text,
    borderWidth: 2,
    borderColor: THEME.colors.background,
  },
  pointerLine: {
    width: 2,
    height: 12,
    backgroundColor: THEME.colors.text,
    opacity: 0.5,
  },
  labels: {
    flexDirection: 'row',
    marginTop: 12,
    height: 20,
    position: 'relative',
    marginBottom: THEME.spacing.xs,
  },
  labelGroup: {
    position: 'absolute',
    alignItems: 'center',
    width: 30,
    marginLeft: -15,
  },
  label: {
    fontFamily: THEME.typography.bold,
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
});
