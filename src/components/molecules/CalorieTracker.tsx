import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';

interface CalorieTrackerProps {
  onCenterPress?: () => void;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({ onCenterPress }) => {
  const { metrics } = useMetrics();
  
  const current = metrics.calories || 0;
  const goal = metrics.calorieGoal || 2500;
  const percentage = (current / goal) * 100;
  const remaining = Math.max(goal - current, 0);

  const waterCurrent = metrics.currentWater || 0;
  const waterGoal = metrics.waterGoal || 2500;
  const waterPercentage = (waterCurrent / waterGoal) * 100;
  const fluidUnit = metrics.preferences.fluid;
  
  
  const size = Dimensions.get('window').width - THEME.spacing.xl * 2; 
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  
  let progressColor = THEME.colors.primary;
  if (percentage >= 100) progressColor = THEME.colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
      </View>

      <View style={styles.svgContainerWrapper}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size}>
            <Circle
              stroke={THEME.colors.surfaceSecondary}
              fill="transparent"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={progressColor}
              fill="transparent"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${center}, ${center}`}
            />
          </Svg>
          <View style={styles.svgTextContainer}>
            <TouchableOpacity onPress={onCenterPress} style={styles.centerScanBtn}>
              <View style={styles.scanIconWrapper}>
                <Ionicons name="barcode-outline" size={36} color={THEME.colors.background} />
              </View>
            </TouchableOpacity>
            <Text style={styles.svgLogText}>
              {current > 0 ? `${current} kcal logged` : 'Log your food!'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{current} • {Math.round(percentage)}%</Text>
        <Text style={styles.statsTextMuted}>Remaining: {remaining}</Text>
      </View>
      
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }
          ]} 
        />
      </View>

      {/* Water Tracking Section */}
      <View style={styles.waterSection}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Water: {converters.formatFluid(waterCurrent, fluidUnit)}</Text>
          <Text style={styles.statsTextMuted}>{Math.round(waterPercentage)}%</Text>
        </View>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(waterPercentage, 100)}%`, backgroundColor: '#3B82F6' } 
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.md,
  },
  header: {
    marginBottom: THEME.spacing.xl,
    paddingHorizontal: THEME.spacing.sm,
  },
  title: {
    color: THEME.colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  svgContainerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xxl,
  },
  svgContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerScanBtn: {
    padding: 8,
  },
  scanIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  svgLogText: {
    color: THEME.colors.textSecondary,
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.sm,
  },
  statsText: {
    color: THEME.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  statsTextMuted: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: THEME.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  waterSection: {
    marginTop: THEME.spacing.xl,
  },
});
