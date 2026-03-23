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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  React.useEffect(() => {
    if (visible && logDate) {
      setDate(logDate);
    } else if (visible) {
      setDate(new Date());
    }
  }, [visible, logDate]);

  const CATEGORIES = [
    { label: 'Calories', value: 'calories' },
    { label: 'Water', value: 'water' },
    { label: 'Weight', value: 'weight' },
    { label: 'Body Part', value: 'body' },
    { label: 'Height', value: 'height' },
  ];
  const CATEGORY_LABELS = CATEGORIES.map(c => c.label);
  const currentLabel = CATEGORIES.find(c => c.value === type)?.label || 'Calories';
  
  const handleCategoryChange = (label: string) => {
    const t = CATEGORIES.find(c => c.label === label)?.value;
    if (t) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setType(t as any);
    }
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
    if (type === 'calories') return [
      { v: 100, i: 'apple-alt' },
      { v: 300, i: 'hamburger' },
      { v: 500, i: 'pizza-slice' }
    ];
    if (type === 'water') return [
      { v: 250, i: 'tint' },
      { v: 500, i: 'glass-whiskey' },
      { v: 750, i: 'wine-glass' }
    ];
    if (type === 'weight') return [
      { v: 0.1, i: 'weight' },
      { v: 0.5, i: 'dumbbell' },
      { v: 1.0, i: 'running' }
    ];
    return [
      { v: 1, i: 'ruler' },
      { v: 2, i: 'pencil-alt' },
      { v: 5, i: 'plus' }
    ];
  };

  const handleQuickAdd = (val: number) => {
    const currentVal = Number(value) || 0;
    setValue((currentVal + val).toString());
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
      if (type === 'weight') {
        await addWeightLog(numericValue, 'kg', date.toISOString());
      } else if (type === 'height') {
        await updateHeight(numericValue);
      } else if (type === 'calories') {
        if (logSubType) {
          await addMealEntry(logSubType, numericValue, date.toISOString());
        } else {
          await addMealEntry('Quick Add', numericValue, date.toISOString());
        }
      } else if (type === 'water') {
        await updateWater((metrics.currentWater || 0) + numericValue, date.toISOString());
      } else {
        await addBodyMeasurement(selectedPart, numericValue, 'cm', date.toISOString());
      }
      setValue('');
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
        <View style={styles.content}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={onClose} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.navTitleContainer}>
              <Text style={styles.navTitle}>{logSubType ? `Log ${logSubType}` : 'Add Entry'}</Text>
            </View>

            <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.navBtn}>
              <Text style={[styles.navBtnText, styles.saveBtnText, loading && { opacity: 0.5 }]}>Save</Text>
            </TouchableOpacity>
          </View>

          {!logSubType && (
            <View style={styles.categoryRow}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = type === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => handleCategoryChange(cat.label)}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    >
                      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.centeredInputCard}>
            {type === 'height' && currentUnit === 'ft' ? (
              <View style={styles.dualInputRow}>
                <View style={styles.dualInputContainer}>
                  <TextInput
                    style={styles.mainInput}
                    keyboardType="number-pad"
                    value={feetValue}
                    onChangeText={setFeetValue}
                    placeholder="5"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    autoFocus
                    selectionColor={THEME.colors.primary}
                  />
                  <Text style={styles.unitLabel}>ft</Text>
                </View>
                <View style={styles.dualInputContainer}>
                  <TextInput
                    style={styles.mainInput}
                    keyboardType="number-pad"
                    value={inchesValue}
                    onChangeText={setInchesValue}
                    placeholder="10"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    selectionColor={THEME.colors.primary}
                  />
                  <Text style={styles.unitLabel}>inch</Text>
                </View>
              </View>
            ) : (
              <View style={styles.valueRow}>
                <TextInput
                  style={[styles.mainInput, { flex: 1 }]}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={THEME.colors.textMuted}
                  autoFocus
                  selectionColor={THEME.colors.primary}
                  numberOfLines={1}
                />
                <Text style={styles.unitLabel}>{currentUnit || (type === 'calories' ? 'kcal' : '')}</Text>
              </View>
            )}
          </View>

          <View style={styles.accessoryContainer}>
            {type === 'body' && (
              <View style={styles.partPickerWrapper}>
                <BodyPartPicker selectedPart={selectedPart} onSelect={(p) => setSelectedPart(p)} />
              </View>
            )}
          </View>

          <View style={styles.quickAddContainer}>
            {getQuickAddOptions().map((opt) => (
              <TouchableOpacity
                key={opt.v}
                onPress={() => handleQuickAdd(opt.v)}
                style={styles.quickAddBubble}
              >
                <FontAwesome5 name={opt.i} size={16} color={THEME.colors.primary} style={{ marginBottom: 4 }} />
                <Text style={styles.quickAddValue}>+{opt.v}</Text>
                <Text style={styles.quickAddUnit}>{type === 'calories' ? 'kcal' : (currentUnit || 'unit')}</Text>
              </TouchableOpacity>
            ))}
          </View>



        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  dismiss: {
    flex: 1,
  },
  content: {
    backgroundColor: 'rgba(11, 15, 20, 0.98)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: THEME.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  navBtn: {
    paddingVertical: 8,
    minWidth: 60,
  },
  navBtnText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 16,
  },
  saveBtnText: {
    color: THEME.colors.primary,
    textAlign: 'right',
  },
  navTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryRow: {
    marginBottom: THEME.spacing.lg,
    marginHorizontal: -THEME.spacing.md, 
  },
  categoryScroll: {
    paddingHorizontal: THEME.spacing.md,
    gap: 8,
    alignItems: 'center',
    height: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  categoryChipText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: THEME.colors.background,
  },
  miniTabs: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.xl,
    maxHeight: 40,
  },
  miniTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
  },
  miniTabActive: {
    backgroundColor: THEME.colors.primary,
  },
  miniTabText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  miniTabTextActive: {
    color: THEME.colors.background,
  },
  centeredInputCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
  },
  mainInput: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 48,
    textAlign: 'center',
    minWidth: 100,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dualInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.xxl, 
  },
  dualInputContainer: {
    alignItems: 'center',
  },
  unitLabel: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textMuted,
    fontSize: 16,
    marginTop: THEME.spacing.xs,
  },
  accessoryContainer: {
    minHeight: 70, 
    justifyContent: 'center',
  },
  partPickerWrapper: {
    marginBottom: THEME.spacing.sm,
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: THEME.spacing.sm,
  },
  quickAddBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddValue: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 16,
  },
  quickAddUnit: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 10,
    opacity: 0.8,
  },
});
