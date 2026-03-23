import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface BMRMeterProps {
  value: string | number;
}

export const BMRMeter: React.FC<BMRMeterProps> = ({ value }) => {
  const bmr = typeof value === 'string' ? parseFloat(value) : value;
  
  
  const min = 1000;
  const max = 3500;
  const clampedBmr = Math.min(Math.max(bmr, min), max);
  const position = ((clampedBmr - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.bmrValue}>{bmr.toFixed(0)}</Text>
          <Text style={styles.bmrLabel}>Base Burn (BMR)</Text>
        </View>
        <View style={styles.iconWrapper}>
          <Ionicons name="flash" size={24} color="#f59e0b" />
        </View>
      </View>

      <View style={styles.meterContainer}>
        <View style={styles.track}>
          {/* Multi-shade orange/amber gradient segments */}
          <View style={[styles.segment, { flex: 1, backgroundColor: '#fef3c7', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
          <View style={[styles.segment, { flex: 1, backgroundColor: '#fde68a' }]} />
          <View style={[styles.segment, { flex: 1, backgroundColor: '#fcd34d' }]} />
          <View style={[styles.segment, { flex: 1, backgroundColor: '#fbbf24' }]} />
          <View style={[styles.segment, { flex: 1, backgroundColor: '#f59e0b', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
        </View>
        
        <View style={[styles.pointer, { left: `${position}%` }]}>
          <View style={styles.pointerDot} />
          <View style={styles.pointerLine} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>calories needed at rest</Text>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeText}>{min}</Text>
          <Text style={styles.rangeText}>{max}+</Text>
        </View>
      </View>
    </View>
  );
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
  bmrValue: {
    fontFamily: THEME.typography.black,
    fontSize: 28,
    color: THEME.colors.text,
  },
  bmrLabel: {
    fontFamily: THEME.typography.semiBold,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#f59e0b',
    borderWidth: 2,
    borderColor: THEME.colors.background,
  },
  pointerLine: {
    width: 2,
    height: 12,
    backgroundColor: '#f59e0b',
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontFamily: THEME.typography.medium,
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  rangeLabels: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeText: {
    fontFamily: THEME.typography.bold,
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
});
