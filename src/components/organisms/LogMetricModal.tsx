import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { THEME } from '../../constants/theme';
import { BodyPartPicker } from '../molecules/BodyPartPicker';
import { BodyPart } from '../../types/metrics';
import { useMetrics } from '../../context/MetricsContext';
import { converters } from '../../utils/converters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LogMetricModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LogMetricModal: React.FC<LogMetricModalProps> = ({
  visible,
  onClose,
}) => {
  const { metrics, logType, logSubType, logDate, addWeightLog, addBodyMeasurement, updateHeight, updateCalories, updateWater, addMealEntry } = useMetrics();
  const [type, setType] = useState<'weight' | 'body' | 'height' | 'calories' | 'water'>(logType);
  const [value, setValue] = useState('');
  const [feetValue, setFeetValue] = useState('');
  const [inchesValue, setInchesValue] = useState('');
  const [selectedPart, setSelectedPart] = useState<BodyPart>('Biceps');
  const [currentUnit, setCurrentUnit] = useState<string>('');
  const [date, setDate] = useState(new Date());

  // Macro States
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isMacroExpanded, setIsMacroExpanded] = useState(false);

  React.useEffect(() => {
    if (visible && logDate) {
      setDate(logDate);
    } else if (visible) {
      setDate(new Date());
    }
  }, [visible, logDate]);

  const CATEGORIES = [
    { label: 'CAL', value: 'calories', icon: 'flash' },
    { label: 'H2O', value: 'water', icon: 'water' },
    { label: 'WGT', value: 'weight', icon: 'scale' },
    { label: 'BDY', value: 'body', icon: 'body' },
    { label: 'HGT', value: 'height', icon: 'resize' },
  ];

  const handleCategoryChange = (val: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setType(val as any);
  };

  
  React.useEffect(() => {
    if (visible) {
      setType(logType);
      if (logType === 'body' && logSubType) {
        setSelectedPart(logSubType as BodyPart);
      }
    }
  }, [visible, logType, logSubType]);

  
  React.useEffect(() => {
    setValue('');
    setFeetValue('');
    setInchesValue('');
    setProtein('');
    setCarbs('');
    setFat('');
    setIsMacroExpanded(false);
  }, [type]);

  
  React.useEffect(() => {
    if (visible) {
      if (type === 'weight') setCurrentUnit(metrics.preferences.weight);
      else if (type === 'height') setCurrentUnit(metrics.preferences.height);
      else if (type === 'body') setCurrentUnit(metrics.preferences.body);
      else if (type === 'water') setCurrentUnit(metrics.preferences.fluid);
      else if (type === 'calories') setCurrentUnit('kcal');
      else setCurrentUnit('');
    }
  }, [visible, type, metrics.preferences]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const getQuickAddOptions = () => {
    if (type === 'calories') return [100, 300, 500];
    if (type === 'water') return [250, 500, 750];
    if (type === 'weight') return [0.1, 0.5, 1.0];
    return [1, 2, 5];
  };

  const handleQuickAdd = (val: number) => {
    const currentVal = Number(value) || 0;
    setValue((currentVal + val).toString());
  };

  const calculateCaloriesFromMacros = () => {
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    const total = (p * 4) + (c * 4) + (f * 9);
    setValue(total.toString());
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  };

  const handleSave = async () => {
    setLoading(true);
    let numericValue = 0;

    if (type === 'height' && currentUnit === 'ft') {
      const ft = Number(feetValue) || 0;
      const inch = Number(inchesValue) || 0;
      numericValue = (ft * 12) + inch;
      if (numericValue === 0) {
        setLoading(false);
        return;
      }
    } else {
      if (!value || isNaN(Number(value))) {
        setLoading(false);
        return;
      }
      numericValue = Number(value);
    }

    
    if (type === 'weight' && currentUnit === 'lb') numericValue = converters.lbToKg(numericValue);
    if (type === 'height' && currentUnit === 'inch') numericValue = converters.inchToCm(numericValue);
    if (type === 'body' && currentUnit === 'inch') numericValue = converters.inchToCm(numericValue);
    if (type === 'height' && currentUnit === 'ft') {
      numericValue = converters.inchToCm(numericValue); 
    }

    try {
      const macroData = isMacroExpanded ? {
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      } : undefined;

      if (type === 'weight') await addWeightLog(numericValue, 'kg', date.toISOString());
      else if (type === 'height') await updateHeight(numericValue);
      else if (type === 'calories') await addMealEntry(logSubType || 'Quick Add', numericValue, date.toISOString(), undefined, macroData);
      else if (type === 'water') await updateWater((metrics.currentWater || 0) + numericValue, date.toISOString());
      else await addBodyMeasurement(selectedPart, numericValue, 'cm', date.toISOString());
      
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.dismiss}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.glassContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerActionBtn}>
              <Ionicons name="chevron-down" size={24} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{logSubType ? logSubType : 'LOG ENTRY'}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                <Ionicons name="calendar-outline" size={12} color={THEME.colors.primary} />
                <Text style={styles.dateText}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerActionBtn}>
              <Ionicons name="checkmark" size={24} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>

          {!logSubType && (
            <View style={styles.segmentedPickerWrapper}>
                <View style={styles.segmentedPicker}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                    key={cat.value}
                    onPress={() => handleCategoryChange(cat.value)}
                    style={[styles.segment, type === cat.value && styles.segmentActive]}
                    >
                    <Ionicons 
                        name={cat.icon as any} 
                        size={14} 
                        color={type === cat.value ? THEME.colors.background : THEME.colors.textMuted} 
                    />
                    {type === cat.value && (
                        <Text style={styles.segmentText}>{cat.label.split(' ')[0]}</Text>
                    )}
                    </TouchableOpacity>
                ))}
                </View>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.heroGlassCard}>
                <View style={styles.heroGlow} />
                {type === 'height' && currentUnit === 'ft' ? (
                  <View style={styles.dualArtRow}>
                    <View style={styles.heroArtBox}>
                        <TextInput
                            style={styles.heroArtInput}
                            keyboardType="number-pad"
                            value={feetValue}
                            onChangeText={setFeetValue}
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.05)"
                            autoFocus
                        />
                        <Text style={styles.heroArtUnit}>FT</Text>
                    </View>
                    <View style={styles.heroArtBox}>
                        <TextInput
                            style={styles.heroArtInput}
                            keyboardType="number-pad"
                            value={inchesValue}
                            onChangeText={setInchesValue}
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.05)"
                        />
                        <Text style={styles.heroArtUnit}>IN</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.heroArtWrapper}>
                    <TextInput
                      style={styles.heroArtInput}
                      value={value}
                      onChangeText={setValue}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.05)"
                      autoFocus
                    />
                    <Text style={styles.heroArtUnit}>{currentUnit.toUpperCase()}</Text>
                  </View>
                )}
            </View>

            <View style={styles.quickBarArtistic}>
              {getQuickAddOptions().map((v) => (
                <TouchableOpacity key={v} onPress={() => handleQuickAdd(v)} style={styles.quickArtBtn}>
                  <Text style={styles.quickArtBtnText}>+{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.luxuryOptions}>
                {type === 'body' && (
                    <View style={styles.bodyPartLUX}>
                        <BodyPartPicker selectedPart={selectedPart} onSelect={setSelectedPart} />
                    </View>
                )}

                {type === 'calories' && (
                    <View style={styles.macroIntegratedLUX}>
                        <TouchableOpacity 
                            style={styles.macroToggleLux} 
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setIsMacroExpanded(!isMacroExpanded);
                            }}
                        >
                            <View style={styles.luxRow}>
                                <View style={styles.luxIconBg}>
                                    <Ionicons name="nutrition" size={18} color={THEME.colors.primary} />
                                </View>
                                <Text style={styles.luxOptionTitle}>Nutritional Blueprint</Text>
                            </View>
                            <Ionicons name={isMacroExpanded ? 'chevron-up' : 'chevron-forward'} size={18} color={THEME.colors.textMuted} />
                        </TouchableOpacity>

                        {isMacroExpanded && (
                            <View style={styles.macroLuxGrid}>
                                {[
                                    { label: 'PRO', val: protein, set: setProtein, color: '#A78BFA' },
                                    { label: 'CHO', val: carbs, set: setCarbs, color: '#FCD34D' },
                                    { label: 'FAT', val: fat, set: setFat, color: '#F87171' },
                                ].map(m => (
                                    <View key={m.label} style={[styles.macroLuxBox, { borderColor: m.color + '30' }]}>
                                        <Text style={[styles.macroLuxLabel, { color: m.color }]}>{m.label}</Text>
                                        <TextInput
                                            style={styles.macroLuxInput}
                                            keyboardType="decimal-pad"
                                            value={m.val}
                                            onChangeText={m.set}
                                            placeholder="0"
                                            placeholderTextColor="rgba(255,255,255,0.05)"
                                        />
                                        <Text style={styles.macroLuxUnit}>GRAMS</Text>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.calcArtBtn} onPress={calculateCaloriesFromMacros}>
                                    <Ionicons name="sync" size={16} color={THEME.colors.primary} />
                                    <Text style={styles.calcArtBtnText}>Auto-calculate Calories</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
          </ScrollView>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}



        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'flex-end',
  },
  dismiss: {
    flex: 1,
  },
  glassContent: {
    backgroundColor: '#0D1117',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.lg,
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  headerActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 11,
    letterSpacing: 3,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(141, 224, 166, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(141, 224, 166, 0.1)',
  },
  dateText: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.primary,
    fontSize: 9,
    letterSpacing: 1,
  },
  segmentedPickerWrapper: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 2,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  segmentedPicker: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  segment: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.background,
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  heroGlassCard: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 24,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primary,
    opacity: 0.02,
    filter: 'blur(20px)',
  },
  heroArtWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroArtInput: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 36,
    textAlign: 'center',
    letterSpacing: -1,
    includeFontPadding: false,
    minWidth: 60,
  },
  heroArtUnit: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.primary,
    fontSize: 12,
    opacity: 0.6,
    letterSpacing: 2,
  },
  dualArtRow: {
    flexDirection: 'row',
    gap: 24,
  },
  heroArtBox: {
    alignItems: 'center',
  },
  quickBarArtistic: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: THEME.spacing.lg,
  },
  quickArtBtn: {
    width: 80,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  quickArtBtnText: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  luxuryOptions: {
    marginBottom: 60,
  },
  bodyPartLUX: {
      marginBottom: THEME.spacing.lg,
  },
  macroIntegratedLUX: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  macroToggleLux: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  luxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  luxIconBg: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(141, 224, 166, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
  },
  luxOptionTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  macroLuxGrid: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  macroLuxBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    height: 56,
  },
  macroLuxLabel: {
    fontFamily: THEME.typography.black,
    fontSize: 8,
    width: 40,
    letterSpacing: 0.5,
    opacity: 0.5,
  },
  macroLuxInput: {
    flex: 1,
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 18,
    textAlign: 'center',
    includeFontPadding: false,
    height: '100%',
  },
  macroLuxUnit: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.textMuted,
    fontSize: 7,
    width: 40,
    textAlign: 'right',
    opacity: 0.4,
  },
  calcArtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(141, 224, 166, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(141, 224, 166, 0.1)',
    marginTop: 8,
  },
  calcArtBtnText: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
