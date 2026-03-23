import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';

interface CalorieTrackerProps {
  onCenterPress?: () => void;
  current?: number;
  goal?: number;
  waterCurrent?: number;
  waterGoal?: number;
  date?: Date;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({ 
  onCenterPress,
  current = 0,
  goal = 2500,
  waterCurrent = 0,
  waterGoal = 2500,
  date = new Date()
}) => {
  const { metrics } = useMetrics();
  
  const percentage = (current / goal) * 100;
  const remaining = Math.max(goal - current, 0);

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
    paddingBottom: THEME.spacing.md,
    paddingTop: 0,
  },
  header: {
    marginBottom: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
  },
  title: {
    color: THEME.colors.text,
    fontSize: 24,
    fontFamily: THEME.typography.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontFamily: THEME.typography.semiBold,
    marginTop: 2,
  },
  svgContainerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
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
    fontSize: 16,
    fontFamily: THEME.typography.medium,
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
    fontSize: 18,
    fontFamily: THEME.typography.black,
  },
  statsTextMuted: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontFamily: THEME.typography.semiBold,
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
