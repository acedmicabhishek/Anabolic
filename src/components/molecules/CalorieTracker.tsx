import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, ClipPath, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';
import { Accelerometer } from 'expo-sensors';
import { BlurView } from 'expo-blur';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const Wave = ({ fill, progress, offset, size }: { fill: string, progress: number, offset: number, size: number }) => {
  const y = size * (1 - progress / 100);
  const waveHeight = 8;
  const path = `
    M 0 ${y}
    C ${size / 3} ${y - waveHeight} ${size / 1.5} ${y + waveHeight} ${size} ${y}
    V ${size}
    H 0
    Z
  `;
  return <Path d={path} fill={fill} />;
};

const AnimatedWaterWave = ({ fill, progress, size, tiltX, phaseOffset, amplitude }: { 
  fill: string, progress: number, size: number, tiltX: number, phaseOffset: number, amplitude: number 
}) => {
  const baseY = size * (1 - progress / 100);
  const tiltAmount = tiltX * 25;
  const wH = amplitude;

  const yLeft = baseY + tiltAmount;
  const yRight = baseY - tiltAmount;
  const yMid = baseY + Math.sin(phaseOffset) * wH;

  const path = `
    M 0 ${yLeft}
    C ${size * 0.25} ${yLeft - wH + Math.sin(phaseOffset) * wH * 0.5}
      ${size * 0.5} ${yMid}
      ${size * 0.75} ${yRight + wH + Math.sin(phaseOffset + 1) * wH * 0.5}
    L ${size} ${yRight}
    V ${size}
    H 0
    Z
  `;
  return <Path d={path} fill={fill} />;
};

interface CalorieTrackerProps {
  onCenterPress?: () => void;
  current?: number;
  goal?: number;
  waterCurrent?: number;
  waterGoal?: number;
  date?: Date;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = React.memo(({
  onCenterPress,
  current = 0,
  goal = 2500,
  waterCurrent = 0,
  waterGoal = 2500,
  date = new Date()
}) => {
  const { metrics } = useMetrics();

  const [tiltX, setTiltX] = useState(0);
  const animatedTilt = useRef(new Animated.Value(0)).current;
  const wavePhase = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x }) => {
      Animated.spring(animatedTilt, {
        toValue: -x,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    });

    const listenerId = animatedTilt.addListener(({ value }) => {
      setTiltX(value);
    });

    const loopAnim = Animated.loop(
      Animated.timing(wavePhase, {
        toValue: Math.PI * 2,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loopAnim.start();
    const phaseId = wavePhase.addListener(({ value }) => {
      setPhase(value);
    });

    return () => {
      sub.remove();
      animatedTilt.removeListener(listenerId);
      wavePhase.removeListener(phaseId);
      loopAnim.stop();
    };
  }, [animatedTilt, wavePhase]);

  const percentage = useMemo(() => (current / goal) * 100, [current, goal]);
  const remaining = useMemo(() => Math.max(goal - current, 0), [goal, current]);

  const waterPercentage = useMemo(() => (waterCurrent / waterGoal) * 100, [waterCurrent, waterGoal]);
  const fluidUnit = metrics.preferences.fluid;

  const size = useMemo(() => Dimensions.get('window').width - THEME.spacing.xl * 2, []);
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = useMemo(() => circumference - (Math.min(percentage, 100) / 100) * circumference, [circumference, percentage]);

  const progressColor = useMemo(() => percentage >= 100 ? THEME.colors.error : THEME.colors.primary, [percentage]);

  const auraBlob1 = useRef(new Animated.Value(0)).current;
  const auraBlob2 = useRef(new Animated.Value(0)).current;
  const auraBlob3 = useRef(new Animated.Value(0)).current;
  const auraScale = useRef(new Animated.Value(1)).current;
  const isOverflow = percentage > 100;
  
  useEffect(() => {
    if (isOverflow) {
      const pulse1 = Animated.loop(
        Animated.sequence([
          Animated.timing(auraBlob1, { toValue: 0.9, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(auraBlob1, { toValue: 0.4, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      );
      const pulse2 = Animated.loop(
        Animated.sequence([
          Animated.timing(auraBlob2, { toValue: 0.7, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(auraBlob2, { toValue: 0.3, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      );
      const pulse3 = Animated.loop(
        Animated.sequence([
          Animated.timing(auraBlob3, { toValue: 0.8, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(auraBlob3, { toValue: 0.25, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      );
      const scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(auraScale, { toValue: 1.06, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(auraScale, { toValue: 0.96, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      );
      pulse1.start(); pulse2.start(); pulse3.start(); scaleLoop.start();
      return () => { pulse1.stop(); pulse2.stop(); pulse3.stop(); scaleLoop.stop(); };
    } else {
      auraBlob1.setValue(0);
      auraBlob2.setValue(0);
      auraBlob3.setValue(0);
      auraScale.setValue(1);
    }
  }, [isOverflow, auraBlob1, auraBlob2, auraBlob3, auraScale]);

  const auraSize = size * 1.6;

  const renderAura = () => {
    if (!isOverflow) return null;
    
    const blobData = [
      { color: 'rgba(255, 160, 40, 0.7)', x: -50, y: -20, s: auraSize * 0.75, anim: auraBlob1, shadow: '#FF9500' },
      { color: 'rgba(255, 50, 120, 0.6)', x: 45, y: -40, s: auraSize * 0.65, anim: auraBlob2, shadow: '#FF3278' },
      { color: 'rgba(0, 210, 180, 0.55)', x: 40, y: 55, s: auraSize * 0.7, anim: auraBlob3, shadow: '#00D2B4' },
      { color: 'rgba(147, 89, 255, 0.5)', x: -45, y: 50, s: auraSize * 0.65, anim: auraBlob2, shadow: '#9359FF' },
      { color: 'rgba(255, 220, 60, 0.4)', x: 0, y: 0, s: auraSize * 0.55, anim: auraBlob1, shadow: '#FFDC3C' },
    ];

    return (
      <Animated.View 
        style={[
          styles.auraContainer, 
          { 
            width: auraSize, 
            height: auraSize, 
            transform: [{ scale: auraScale }] 
          }
        ]}
      >
        {blobData.map((blob, i) => (
          <Animated.View
            key={`blob-${i}`}
            style={{
              position: 'absolute',
              width: blob.s,
              height: blob.s,
              borderRadius: blob.s / 2,
              backgroundColor: blob.color,
              left: (auraSize - blob.s) / 2 + blob.x,
              top: (auraSize - blob.s) / 2 + blob.y,
              opacity: blob.anim,
              shadowColor: blob.shadow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 60,
              elevation: 25,
            }}
          />
        ))}
         <BlurView
          intensity={100}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  };

  const consumedMacros = useMemo(() => {
    const todayStr = date.toISOString().split('T')[0];
    const todayMeals = metrics.meals.filter(meal => meal.date.startsWith(todayStr));

    return todayMeals.reduce((acc, meal) => ({
      protein: acc.protein + (meal.macros?.protein || 0),
      carbs: acc.carbs + (meal.macros?.carbs || 0),
      fat: acc.fat + (meal.macros?.fat || 0),
    }), { protein: 0, carbs: 0, fat: 0 });
  }, [metrics.meals, date]);

  const targets = metrics.macroTargets || { protein: 150, carbs: 250, fat: 70 };

  const macroProgress = [
    { label: 'Protein', current: consumedMacros.protein, target: targets.protein, color: '#8B5CF6', icon: 'fitness' },
    { label: 'Carbs', current: consumedMacros.carbs, target: targets.carbs, color: '#F59E0B', icon: 'leaf' },
    { label: 'Fats', current: consumedMacros.fat, target: targets.fat, color: '#EF4444', icon: 'pizza' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.svgContainerWrapper}>
        <View style={styles.svgContainer}>
          {renderAura()}
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="innerShadow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="80%" stopColor={THEME.colors.background} stopOpacity="0" />
                <Stop offset="100%" stopColor="rgba(0,0,0,0.5)" stopOpacity="1" />
              </RadialGradient>
              <ClipPath id="circleClip">
                <Circle cx={center} cy={center} r={radius - 2} />
              </ClipPath>
            </Defs>

            {/* Background Circle */}
            <Circle
              stroke="rgba(255,255,255,0.03)"
              fill={THEME.colors.surface}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />

            <G clipPath="url(#circleClip)">
                <AnimatedWaterWave size={size} progress={Math.min(percentage, 105)} fill={progressColor + '22'} tiltX={tiltX} phaseOffset={phase} amplitude={10} />
                <AnimatedWaterWave size={size} progress={Math.min(percentage, 105) - 2} fill={progressColor + '44'} tiltX={tiltX} phaseOffset={phase + 1.5} amplitude={7} />
                <AnimatedWaterWave size={size} progress={Math.min(percentage, 105) - 5} fill={progressColor + '88'} tiltX={tiltX} phaseOffset={phase + 3} amplitude={5} />
            </G>

            {/* Inner Shadow Effect */}
            <Circle cx={center} cy={center} r={radius} fill="url(#innerShadow)" />

            {/* Progress Ring */}
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
              <View style={styles.scanIconWrapperArtistic}>
                <Ionicons name="barcode-outline" size={36} color={THEME.colors.background} />
                <View style={styles.scanGlow} />
              </View>
            </TouchableOpacity>
            <Text style={styles.svgLogTextArtistic}>
              {current > 0 ? `${current}` : '0'}
            </Text>
            <Text style={styles.svgUnitText}>KCAL LOGGED</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{current} • {Math.round(percentage)}%</Text>
        <Text style={styles.statsTextMuted}>Remaining: {remaining}</Text>
      </View>

      <View style={styles.progressBackground}>
        <LinearGradient
          colors={[progressColor, progressColor + '99']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${Math.min(percentage, 100)}%` }
          ]}
        />
      </View>

      {/* Water Tracking Section */}
      <View style={styles.waterSection}>
        <View style={styles.statsContainer}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="water" size={16} color="#3B82F6" />
            <Text style={styles.statsText}> Water</Text>
          </View>
          <Text style={styles.statsTextMuted}>{converters.formatFluid(waterCurrent, fluidUnit)} / {converters.formatFluid(waterGoal, fluidUnit)}</Text>
        </View>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={['#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              { width: `${Math.min(waterPercentage, 100)}%` }
            ]}
          />
        </View>
      </View>

      {/* Macros Section */}
      <View style={styles.macroSection}>
        <Text style={styles.sectionHeading}>Daily Macros</Text>
        {macroProgress.map((macro) => {
          const perc = Math.min((macro.current / macro.target) * 100, 100);
          return (
            <View key={macro.label} style={styles.macroItem}>
              <View style={styles.statsContainer}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name={macro.icon as keyof typeof Ionicons.glyphMap} size={14} color={macro.color} />
                  <Text style={styles.macroLabel}> {macro.label}</Text>
                </View>
                <Text style={styles.macroValue}>
                  {Math.round(macro.current)}g <Text style={{ color: THEME.colors.textSecondary, opacity: 0.5 }}>/ {macro.target}g</Text>
                </Text>
              </View>
              <View style={styles.macroProgressBg}>
                <LinearGradient
                  colors={[macro.color, macro.color + 'aa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${perc}%` }
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: THEME.spacing.md,
    paddingTop: 0,
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
  overflowAura: {
    position: 'absolute',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  auraContainer: {
    position: 'absolute',
    zIndex: -1,
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
  svgLogTextArtistic: {
    color: THEME.colors.text,
    fontSize: 42,
    fontFamily: THEME.typography.black,
    marginTop: 4,
    letterSpacing: -1,
  },
  svgUnitText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.typography.black,
    letterSpacing: 2,
    opacity: 0.7,
  },
  scanIconWrapperArtistic: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  scanGlow: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: THEME.colors.primary,
      opacity: 0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    color: THEME.colors.text,
    fontSize: 14,
    fontFamily: THEME.typography.black,
    letterSpacing: 0.5,
  },
  statsTextMuted: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontFamily: THEME.typography.bold,
    opacity: 0.6,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  waterSection: {
    marginTop: THEME.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 24,
    paddingVertical: THEME.spacing.md,
    marginHorizontal: THEME.spacing.xs,
  },
  macroSection: {
    marginTop: THEME.spacing.xxl,
    paddingTop: THEME.spacing.xl,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  sectionHeading: {
    color: THEME.colors.text,
    fontSize: 12,
    fontFamily: THEME.typography.black,
    marginBottom: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.8,
  },
  macroItem: {
    marginBottom: THEME.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderRadius: 20,
    paddingVertical: 12,
    marginHorizontal: THEME.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  macroLabel: {
    color: THEME.colors.textSecondary,
    fontFamily: THEME.typography.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  macroValue: {
    color: THEME.colors.text,
    fontFamily: THEME.typography.black,
    fontSize: 13,
  },
  macroProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: THEME.spacing.md,
    marginTop: 8,
  },
});
