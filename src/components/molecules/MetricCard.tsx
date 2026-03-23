import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';

interface MetricCardProps {
  label: string;
  value: string | number;
  type: 'weight' | 'height' | 'body' | 'fluid' | 'calories';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  type
}) => {
  const { metrics } = useMetrics();
  const prefs = metrics.preferences;

  let displayValue = value.toString();
  let displayUnit = '';

  if (type === 'weight') {
    displayUnit = prefs.weight;
    displayValue = prefs.weight === 'lb' ? converters.kgToLb(Number(value)).toFixed(1) : Number(value).toFixed(1);
  } else if (type === 'height') {
    displayUnit = prefs.height;
    if (prefs.height === 'ft') {
      const { feet, inches } = converters.cmToFt(Number(value));
      displayValue = `${feet}'${inches}"`;
      displayUnit = ''; 
    } else if (prefs.height === 'inch') {
      displayValue = converters.cmToInch(Number(value)).toFixed(1);
      displayUnit = 'in';
    } else {
      displayValue = Number(value).toFixed(1);
      displayUnit = 'cm';
    }
  } else if (type === 'body') {
    displayUnit = prefs.body === 'inch' ? 'in' : 'cm';
    displayValue = (prefs.body === 'inch' ? converters.cmToInch(Number(value)) : Number(value)).toFixed(1);
  } else if (type === 'fluid') {
    displayUnit = prefs.fluid === 'oz' ? 'fl. oz' : 'ml';
    displayValue = (prefs.fluid === 'oz' ? converters.mlToOz(Number(value)) : Number(value)).toFixed(0);
  } else if (type === 'calories') {
    displayUnit = 'kcal';
    displayValue = Number(value).toString();
  }

  
  
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{displayValue}</Text>
        <Text style={styles.unit}>{displayUnit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  label: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 28,
  },
  unit: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.textMuted,
    fontSize: 14,
    marginLeft: 2,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontFamily: THEME.typography.bold,
    fontSize: 10,
  },
});
