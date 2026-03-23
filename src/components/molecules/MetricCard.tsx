import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';

interface MetricCardProps {
  label: string;
  value: string | number;
  type: 'weight' | 'height' | 'body' | 'fluid' | 'calories';
  iconName?: string;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = React.memo(({ 
  label, 
  value, 
  type,
  iconName,
  onPress
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

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <View style={styles.labelContainer}>
          {iconName && <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={14} color={THEME.colors.primary} style={{ marginRight: 6 }} />}
          <Text style={styles.label}>{label}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={12} color={THEME.colors.textMuted} />}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{displayValue}</Text>
        <Text style={styles.unit}>{displayUnit}</Text>
      </View>
    </Container>
  );
});

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
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 11,
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
    fontSize: 24,
  },
  unit: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginLeft: 2,
  },
});
