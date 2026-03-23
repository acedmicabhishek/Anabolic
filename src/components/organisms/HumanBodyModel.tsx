import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { DimensionValue } from 'react-native';
import { THEME } from '../../constants/theme';
import { BodyMeasurementLog } from '../../types/metrics';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';

interface HumanBodyModelProps {
  measurements: BodyMeasurementLog[];
}

export const HumanBodyModel: React.FC<HumanBodyModelProps> = ({ measurements }) => {
  const { metrics } = useMetrics();
  const bodyUnit = metrics.preferences.body;

  
  const recentMeasurements = measurements.reduce((acc: Record<string, BodyMeasurementLog>, log) => {
    if (!acc[log.part] || new Date(log.date).getTime() > new Date(acc[log.part].date).getTime()) {
      acc[log.part] = log;
    }
    return acc;
  }, {});

  const SVH_WIDTH = 120;
  const SVH_HEIGHT = 300;
  const scale = 1;

  
  const renderBadge = (partName: string, top: DimensionValue, left: DimensionValue) => {
    const data = recentMeasurements[partName];
    if (!data) return null;
    return (
      <View style={[styles.badgeContainer, { top, left }]}>
        <View style={styles.badgeLine} />
        <View style={styles.badgeBox}>
          <Text style={styles.badgeLabel}>{partName}</Text>
          <Text style={styles.badgeValue}>{converters.formatBody(data.value, bodyUnit)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Body Composition</Text>
      <View style={styles.bodyContainer}>
        <Svg width={SVH_WIDTH * scale} height={SVH_HEIGHT * scale} viewBox="0 0 120 300">
          <Path 
            d="M60 10 C68 10 75 17 75 25 C75 33 68 40 60 40 C52 40 45 33 45 25 C45 17 52 10 60 10 Z 
               M50 45 L70 45 L95 65 L85 140 L70 130 L70 160 L65 290 L55 290 L50 160 L50 130 L35 140 L25 65 Z" 
            fill="transparent"
            stroke={THEME.colors.primary}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Subtle glow/shadow or aesthetic accents */}
          <Circle cx="60" cy="90" r="10" fill="rgba(141, 224, 166, 0.1)" />
          <Circle cx="45" cy="110" r="15" fill="rgba(141, 224, 166, 0.1)" />
          <Circle cx="75" cy="110" r="15" fill="rgba(141, 224, 166, 0.1)" />
        </Svg>
        
        {/* Render badges absolutely positioned over SVG regions */}
        {renderBadge('Shoulders', '15%', '85%')}
        {renderBadge('Chest', '30%', '5%')}
        {renderBadge('Biceps', '40%', '80%')}
        {renderBadge('Waist', '55%', '5%')}
        {renderBadge('Quads', '70%', '80%')}
        {renderBadge('Calves', '90%', '5%')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.roundness.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 20,
    marginBottom: THEME.spacing.lg,
    alignSelf: 'flex-start',
  },
  bodyContainer: {
    position: 'relative',
    width: Dimensions.get('window').width - THEME.spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
  },
  badgeContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLine: {
    width: 20,
    height: 1,
    backgroundColor: THEME.colors.primary,
  },
  badgeBox: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.roundness.sm,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceSecondary,
  },
  badgeLabel: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 12,
  },
});
