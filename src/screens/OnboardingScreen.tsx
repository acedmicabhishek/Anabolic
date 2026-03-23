import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Button } from '../components/atoms/Button';
import { VerticalWheelPicker } from '../components/atoms/VerticalWheelPicker';
import { useMetrics } from '../context/MetricsContext';
import { GradientText } from '../components/atoms/GradientText';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, addWeightLog } = useMetrics();
  const [step, setStep] = useState(1);

  
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  const [weight, setWeight] = useState('75');
  const [targetWeight, setTargetWeight] = useState('70');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  
  const [height, setHeight] = useState('175');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  const [tdee, setTdee] = useState(0);
  const [calcCal, setCalcCal] = useState(0);
  const [calcProt, setCalcProt] = useState(0);
  const [calcCarbs, setCalcCarbs] = useState(0);
  const [calcFat, setCalcFat] = useState(0);

  const calculateTargets = () => {
    const w = weightUnit === 'lbs' ? (Number(weight) || 165) / 2.20462 : (Number(weight) || 75);
    const h = heightUnit === 'ft' ? ((Number(feet) || 5) * 12 + (Number(inches) || 0)) * 2.54 : (Number(height) || 175);
    const a = Number(age) || 25;
    
    
    const bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161);
    
    
    const currentTdee = Math.round(bmr * 1.3);
    setTdee(currentTdee);

    let finalCals = currentTdee;
    if (goal === 'lose') finalCals -= 500;
    if (goal === 'gain') finalCals += 500;
    
    setCalcCal(finalCals);

    
    const p = Math.round(w * 2.0);
    
    const f = Math.round(w * 0.8);
    
    const c = Math.round((finalCals - (p * 4) - (f * 9)) / 4);

    setCalcProt(p);
    setCalcFat(f);
    setCalcCarbs(c > 0 ? c : 0);
  };

  const nextStep = () => {
    if (step === 3) {
      calculateTargets();
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    const numericWeight = weightUnit === 'lbs' ? (Number(weight) || 165) / 2.20462 : (Number(weight) || 75);
    await addWeightLog(numericWeight, 'kg');

    const finalHeight = heightUnit === 'ft' ? ((Number(feet) || 5) * 12 + (Number(inches) || 0)) * 2.54 : (Number(height) || 175);

    const numericTargetWeight = weightUnit === 'lbs' ? (Number(targetWeight) || 155) / 2.20462 : (Number(targetWeight) || 70);

    await completeOnboarding({
      age: Number(age),
      gender,
      height: finalHeight,
      goal,
      targetWeight: goal === 'maintain' ? null : numericTargetWeight,
      calorieGoal: calcCal,
      macroTargets: {
        protein: calcProt,
        carbs: calcCarbs,
        fat: calcFat,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        
        {/* Dynamic Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevStep} disabled={step === 1} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={step === 1 ? 'transparent' : THEME.colors.text} />
          </TouchableOpacity>
          <View style={styles.progressDots}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconHero}>
                <Ionicons name="body" size={40} color={THEME.colors.primary} />
              </View>
              <GradientText style={styles.title}>Welcome</GradientText>
              <Text style={styles.subtitle}>Let's calibrate your profile.</Text>
              
              <View style={styles.compactInputGroup}>
                <Text style={styles.compactLabel}>Biological Sex</Text>
                <View style={styles.genderToggle}>
                  <TouchableOpacity 
                    style={[styles.genderToggleBtn, gender === 'male' && styles.genderToggleBtnActive]} 
                    onPress={() => setGender('male')}
                  >
                    <Ionicons name="male" size={18} color={gender === 'male' ? THEME.colors.background : THEME.colors.textMuted} />
                    <Text style={[styles.genderToggleText, gender === 'male' && styles.genderToggleTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.genderToggleBtn, gender === 'female' && styles.genderToggleBtnActive]} 
                    onPress={() => setGender('female')}
                  >
                    <Ionicons name="female" size={18} color={gender === 'female' ? THEME.colors.background : THEME.colors.textMuted} />
                    <Text style={[styles.genderToggleText, gender === 'female' && styles.genderToggleTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: THEME.spacing.xl }} />

              <View style={styles.compactInputGroup}>
                <Text style={styles.compactLabel}>Age</Text>
                <View style={styles.pickerWrapper}>
                  <VerticalWheelPicker
                    items={Array.from({length: 80 - 14 + 1}, (_, i) => (i + 14).toString())}
                    value={age}
                    onValueChange={setAge}
                    width={100}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconHero}>
                <Ionicons name="scale" size={64} color={THEME.colors.primary} />
              </View>
              <GradientText style={styles.title}>Your Body</GradientText>
              <Text style={styles.subtitle}>Crucial metrics to compute your core BMR.</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.label}>Height</Text>
                  <View style={styles.unitToggle}>
                    <TouchableOpacity style={[styles.unitBtn, heightUnit === 'cm' && styles.unitBtnActive]} onPress={() => setHeightUnit('cm')}><Text style={[styles.unitText, heightUnit === 'cm' && styles.unitTextActive]}>cm</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.unitBtn, heightUnit === 'ft' && styles.unitBtnActive]} onPress={() => setHeightUnit('ft')}><Text style={[styles.unitText, heightUnit === 'ft' && styles.unitTextActive]}>ft/in</Text></TouchableOpacity>
                  </View>
                </View>

                {heightUnit === 'cm' ? (
                  <VerticalWheelPicker items={Array.from({length: 151}, (_, i) => (i + 100).toString())} value={height} onValueChange={setHeight} width={120} />
                ) : (
                  <View style={{flexDirection: 'row', justifyContent: 'center', gap: 16}}>
                    <View style={{alignItems: 'center'}}>
                      <VerticalWheelPicker items={['4','5','6','7','8']} value={feet} onValueChange={setFeet} width={80} />
                      <Text style={styles.labelCenterMuted}>ft</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <VerticalWheelPicker items={Array.from({length: 12}, (_, i) => i.toString())} value={inches} onValueChange={setInches} width={80} />
                      <Text style={styles.labelCenterMuted}>in</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.label}>Weight</Text>
                  <View style={styles.unitToggle}>
                    <TouchableOpacity style={[styles.unitBtn, weightUnit === 'kg' && styles.unitBtnActive]} onPress={() => setWeightUnit('kg')}><Text style={[styles.unitText, weightUnit === 'kg' && styles.unitTextActive]}>kg</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.unitBtn, weightUnit === 'lbs' && styles.unitBtnActive]} onPress={() => setWeightUnit('lbs')}><Text style={[styles.unitText, weightUnit === 'lbs' && styles.unitTextActive]}>lbs</Text></TouchableOpacity>
                  </View>
                </View>
                {weightUnit === 'kg' ? (
                  <VerticalWheelPicker items={Array.from({length: 121}, (_, i) => (i + 30).toString())} value={weight} onValueChange={setWeight} width={120} />
                ) : (
                  <VerticalWheelPicker items={Array.from({length: 251}, (_, i) => (i + 60).toString())} value={weight} onValueChange={setWeight} width={120} />
                )}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconHero}>
                <Ionicons name="compass" size={64} color={THEME.colors.primary} />
              </View>
              <GradientText style={styles.title}>Your Goal</GradientText>
              <Text style={styles.subtitle}>What physical adaptation are we striving for?</Text>
              
              {goal !== 'maintain' && (
                <View style={[styles.inputGroup, { marginBottom: THEME.spacing.xl }]}>
                  <Text style={styles.labelCenter}>Target Weight ({weightUnit})</Text>
                  {weightUnit === 'kg' ? (
                    <VerticalWheelPicker items={Array.from({length: 121}, (_, i) => (i + 30).toString())} value={targetWeight} onValueChange={setTargetWeight} width={120} />
                  ) : (
                    <VerticalWheelPicker items={Array.from({length: 251}, (_, i) => (i + 60).toString())} value={targetWeight} onValueChange={setTargetWeight} width={120} />
                  )}
                </View>
              )}

              <TouchableOpacity style={[styles.goalCard, goal === 'lose' && styles.goalCardActive]} onPress={() => setGoal('lose')}>
                <View style={[styles.goalIconBox, goal === 'lose' && styles.goalIconBoxActive]}>
                  <Ionicons name="flame" size={32} color={goal === 'lose' ? THEME.colors.background : THEME.colors.textSecondary} />
                </View>
                <View style={styles.goalTextCol}>
                  <Text style={[styles.goalTitle, goal === 'lose' && styles.goalTitleActive]}>Lose Fat</Text>
                  <Text style={styles.goalDesc}>Sustained caloric deficit to strip body fat.</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.goalCard, goal === 'maintain' && styles.goalCardActive]} onPress={() => setGoal('maintain')}>
                <View style={[styles.goalIconBox, goal === 'maintain' && styles.goalIconBoxActive]}>
                  <Ionicons name="shield-checkmark" size={32} color={goal === 'maintain' ? THEME.colors.background : THEME.colors.textSecondary} />
                </View>
                <View style={styles.goalTextCol}>
                  <Text style={[styles.goalTitle, goal === 'maintain' && styles.goalTitleActive]}>Maintain</Text>
                  <Text style={styles.goalDesc}>Recomp and maintain your current weight.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.goalCard, goal === 'gain' && styles.goalCardActive]} onPress={() => setGoal('gain')}>
                <View style={[styles.goalIconBox, goal === 'gain' && styles.goalIconBoxActive]}>
                  <Ionicons name="barbell" size={32} color={goal === 'gain' ? THEME.colors.background : THEME.colors.textSecondary} />
                </View>
                <View style={styles.goalTextCol}>
                  <Text style={[styles.goalTitle, goal === 'gain' && styles.goalTitleActive]}>Build Muscle</Text>
                  <Text style={styles.goalDesc}>Slight caloric surplus to maximize mass gains.</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
               <View style={styles.iconHero}>
                <Ionicons name="analytics" size={64} color={THEME.colors.primary} />
              </View>
              <GradientText style={styles.title}>The Protocol</GradientText>
              <Text style={styles.subtitle}>Based on your TDEE (~{tdee} kcal), here is your bespoke algorithm. You can manually tweak these anytime.</Text>
              
              <View style={styles.macroCard}>
                <Text style={styles.labelCenter}>Target Daily Intake</Text>
                <TextInput style={styles.megaInput} keyboardType="number-pad" value={calcCal.toString()} onChangeText={(v) => setCalcCal(Number(v))} />
                <Text style={styles.labelCenterMuted}>KCAL</Text>
                
                <View style={styles.macroRow}>
                  <View style={styles.macroCol}>
                    <Text style={styles.labelCenter}>Protein</Text>
                    <TextInput style={styles.heroInputSmall} keyboardType="number-pad" value={calcProt.toString()} onChangeText={(v) => setCalcProt(Number(v))} numberOfLines={1} />
                    <Text style={styles.labelCenterMuted}>GRAMS</Text>
                  </View>
                  <View style={styles.macroCol}>
                    <Text style={styles.labelCenter}>Carbs</Text>
                    <TextInput style={styles.heroInputSmall} keyboardType="number-pad" value={calcCarbs.toString()} onChangeText={(v) => setCalcCarbs(Number(v))} numberOfLines={1} />
                    <Text style={styles.labelCenterMuted}>GRAMS</Text>
                  </View>
                  <View style={styles.macroCol}>
                    <Text style={styles.labelCenter}>Fat</Text>
                    <TextInput style={styles.heroInputSmall} keyboardType="number-pad" value={calcFat.toString()} onChangeText={(v) => setCalcFat(Number(v))} numberOfLines={1} />
                    <Text style={styles.labelCenterMuted}>GRAMS</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step < 4 ? (
            <Button title="Continue" onPress={nextStep} style={{ width: '100%' }} />
          ) : (
            <Button title="Initialize App" onPress={handleFinish} style={{ width: '100%' }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { flex: 1 },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg, 
    paddingTop: THEME.spacing.xl,
    paddingBottom: THEME.spacing.md,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  progressDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 40, height: 4, borderRadius: 2, backgroundColor: THEME.colors.surfaceSecondary },
  dotActive: { backgroundColor: THEME.colors.primary },
  
  scroll: { padding: THEME.spacing.xl, paddingBottom: 60 },
  stepContainer: { flex: 1, paddingTop: THEME.spacing.sm, alignItems: 'center' },
  iconHero: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(52, 211, 153, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: THEME.spacing.lg, alignSelf: 'center' },
  title: { fontFamily: THEME.typography.black, color: THEME.colors.text, fontSize: 28, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontFamily: THEME.typography.medium, color: THEME.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: THEME.spacing.xl, lineHeight: 20, paddingHorizontal: THEME.spacing.md },
  
  inputGroup: { marginBottom: THEME.spacing.xl, alignItems: 'center', width: '100%' },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: THEME.spacing.sm },
  unitToggle: { flexDirection: 'row', backgroundColor: THEME.colors.surfaceSecondary, borderRadius: THEME.roundness.sm, padding: 2 },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: THEME.roundness.sm },
  unitBtnActive: { backgroundColor: THEME.colors.primary },
  unitText: { fontFamily: THEME.typography.bold, color: THEME.colors.textSecondary, fontSize: 12 },
  unitTextActive: { color: THEME.colors.background },
  
  label: { fontFamily: THEME.typography.bold, color: THEME.colors.textMuted, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  labelCenter: { fontFamily: THEME.typography.bold, color: THEME.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: THEME.spacing.sm, textAlign: 'center' },
  labelCenterMuted: { fontFamily: THEME.typography.bold, color: THEME.colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4, opacity: 0.5 },
  
  heroInput: { 
    fontFamily: THEME.typography.black, 
    color: THEME.colors.primary, 
    fontSize: 48, 
    borderBottomWidth: 3, 
    borderBottomColor: THEME.colors.surfaceSecondary, 
    textAlign: 'center',
    minWidth: 150,
  },
  heroInputSmall: { 
    fontFamily: THEME.typography.black, 
    color: THEME.colors.primary, 
    fontSize: 24, 
    borderBottomWidth: 2, 
    borderBottomColor: THEME.colors.surfaceSecondary, 
    textAlign: 'center',
    width: '100%',
  },
  megaInput: { 
    fontFamily: THEME.typography.black, 
    color: THEME.colors.primary, 
    fontSize: 54, 
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderCard: { flex: 1, backgroundColor: THEME.colors.surface, padding: THEME.spacing.lg, borderRadius: THEME.roundness.md, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  genderCardActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary, transform: [{ scale: 1.02 }] },
  genderText: { fontFamily: THEME.typography.black, color: THEME.colors.textSecondary, fontSize: 16 },
  genderTextActive: { color: THEME.colors.background },
  
  goalCard: { backgroundColor: THEME.colors.surface, padding: THEME.spacing.lg, borderRadius: THEME.roundness.lg, flexDirection: 'row', alignItems: 'center', marginBottom: THEME.spacing.md, borderWidth: 2, borderColor: 'transparent' },
  goalCardActive: { borderColor: THEME.colors.primary, backgroundColor: 'rgba(52, 211, 153, 0.05)', transform: [{ scale: 1.02 }] },
  goalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: THEME.colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginRight: THEME.spacing.lg },
  goalIconBoxActive: { backgroundColor: THEME.colors.primary },
  goalTextCol: { flex: 1 },
  goalTitle: { fontFamily: THEME.typography.black, color: THEME.colors.text, fontSize: 18, marginBottom: 4 },
  goalTitleActive: { color: THEME.colors.primary },
  goalDesc: { fontFamily: THEME.typography.medium, color: THEME.colors.textSecondary, fontSize: 12, lineHeight: 18 },
  
  macroCard: { backgroundColor: THEME.colors.surface, borderRadius: THEME.roundness.xl, padding: THEME.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  macroRow: { flexDirection: 'row', gap: 16, marginTop: THEME.spacing.xxl, width: '100%' },
  macroCol: { flex: 1, alignItems: 'center' },
  
  footer: { paddingHorizontal: THEME.spacing.xl, paddingBottom: Platform.OS === 'ios' ? 40 : THEME.spacing.xxl, paddingTop: THEME.spacing.md },

  compactInputGroup: { width: '100%', alignItems: 'center', marginBottom: THEME.spacing.xl },
  compactLabel: { fontFamily: THEME.typography.bold, color: THEME.colors.textMuted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: THEME.spacing.md },
  genderToggle: { flexDirection: 'row', backgroundColor: THEME.colors.surfaceSecondary, borderRadius: 16, padding: 4, width: '100%', maxWidth: 300 },
  genderToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  genderToggleBtnActive: { backgroundColor: THEME.colors.primary, shadowColor: THEME.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  genderToggleText: { fontFamily: THEME.typography.bold, color: THEME.colors.textMuted, fontSize: 14 },
  genderToggleTextActive: { color: THEME.colors.background },
  pickerWrapper: { height: 160, justifyContent: 'center', paddingTop: 10 },
});
