import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { Button } from '../components/atoms/Button';
import { storage } from '../services/storage';
import { useMetrics } from '../context/MetricsContext';
import { GradientText } from '../components/atoms/GradientText';
import { SettingsIcon } from '../components/atoms/SettingsIcon';

export const SettingsScreen: React.FC = () => {
  const { metrics, isLoading, simulateData, setCalorieGoal, setWaterGoal, setTargetWeight, updateMacros, updatePreferences } = useMetrics();

  const currentPrefs = metrics.preferences || { weight: 'kg', height: 'cm', body: 'cm', fluid: 'ml' };

  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('https://api.github.com/repos/acedmicabhishek/Anabolic/releases');
      if (!response.ok) throw new Error('Check failed');
      const releases = await response.json();

      if (!releases || releases.length === 0) {
        showStatus('Update Status', 'Your version is current.', 'success');
        return;
      }

      const latestRelease = releases[0];
      const latestVersionNum = parseFloat(latestRelease.name || latestRelease.tag_name);
      const currentVersionNum = 1.0;

      if (latestVersionNum > currentVersionNum) {
        showStatus('Update Found', `v${latestVersionNum} is available via GitHub Repo.`, 'success');
      } else {
        showStatus('Up to Date', 'You are running the latest version.', 'success');
      }
    } catch {
      showStatus('Error', 'Update check failed.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const [calGoal, setCalGoal] = useState((metrics.calorieGoal || 2500).toString());
  const [waterGoal, setWGoal] = useState((metrics.waterGoal || 2500).toString());
  const [protein, setProtein] = useState((metrics.macroTargets?.protein || 150).toString());
  const [carbs, setCarbs] = useState((metrics.macroTargets?.carbs || 250).toString());
  const [fat, setFat] = useState((metrics.macroTargets?.fat || 70).toString());
  const [targetWeightValue, setTargetWeightValue] = useState((metrics.targetWeight || '').toString());

  const [statusModal, setStatusModal] = useState<{ visible: boolean, title: string, message: string, type: 'success' | 'error' }>({
    visible: false, title: '', message: '', type: 'success'
  });

  const showStatus = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setStatusModal({ visible: true, title, message, type });
  };

  const handleSaveTargets = async () => {
    await setCalorieGoal(Number(calGoal) || 2000);
    await setWaterGoal(Number(waterGoal) || 2000);
    await setTargetWeight(Number(targetWeightValue) || 0);
    await updateMacros({
      protein: Number(protein) || 150,
      carbs: Number(carbs) || 250,
      fat: Number(fat) || 70,
    });
    showStatus('Success', 'Targets updated successfully.');
  };

  // Macro Gauge Logic
  const macroSplit = useMemo(() => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    const pCal = p * 4;
    const cCal = c * 4;
    const fCal = f * 9;
    const total = pCal + cCal + fCal;
    if (total === 0) return { p: 33.3, c: 33.3, f: 33.4 };
    return {
      p: (pCal / total) * 100,
      c: (cCal / total) * 100,
      f: (fCal / total) * 100,
    };
  }, [protein, carbs, fat]);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteInput, setDeleteInput] = useState('');

  const initiateClearData = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDeleteCode(code);
    setDeleteInput('');
    setDeleteModalVisible(true);
  };

  const confirmClearData = async () => {
    if (deleteInput === deleteCode) {
      setDeleteModalVisible(false);
      await storage.clear();
      showStatus('Cleared', 'All data has been reset.');
    } else {
      showStatus('Incorrect', 'Verification code mismatch.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <SettingsIcon size={28} color={THEME.colors.primary} />
            <GradientText style={styles.title}>Settings</GradientText>
          </View>
          <Text style={styles.subtitle}>Optimize your performance baseline</Text>
        </View>

        {/* Measurement Units */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} style={styles.premiumCard}>
            {[
              { label: 'Weight', icon: 'scale-outline', options: ['kg', 'lb'], current: currentPrefs.weight, key: 'weight' },
              { label: 'Height', icon: 'resize-outline', options: ['cm', 'ft'], current: currentPrefs.height, key: 'height' },
              { label: 'Body', icon: 'body-outline', options: ['cm', 'in'], current: currentPrefs.body, key: 'body' },
              { label: 'Fluid', icon: 'water-outline', options: ['ml', 'oz'], current: currentPrefs.fluid, key: 'fluid' },
            ].map((pref, idx) => (
              <View key={pref.label} style={[styles.prefRow, idx > 0 && styles.prefSeparator]}>
                <View style={styles.prefLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={pref.icon as any} size={14} color={THEME.colors.primary} />
                  </View>
                  <Text style={styles.prefLabel}>{pref.label}</Text>
                </View>
                <View style={styles.segmentedControl}>
                  {pref.options.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => updatePreferences({ [pref.key]: opt as any })}
                      style={[styles.segmentBtn, pref.current === opt && styles.segmentBtnActive]}
                    >
                      <Text style={[styles.segmentText, pref.current === opt && styles.segmentTextActive]}>{opt.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Nutrition Core Priorities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Main Goals</Text>
          </View>
          <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} style={styles.premiumCard}>
            {[
              { label: 'Calorie Goal', val: calGoal, set: setCalGoal, sub: 'KCAL', icon: 'flash', color: '#10B981' },
              { label: 'Hydration Goal', val: waterGoal, set: setWGoal, sub: 'ML', icon: 'water', color: '#3B82F6' },
              { label: 'Weight Goal', val: targetWeightValue, set: setTargetWeightValue, sub: metrics.preferences.weight.toUpperCase(), icon: 'trophy', color: '#F59E0B' },
            ].map((item, idx) => (
              <View key={item.label} style={[styles.priorityRow, idx > 0 && styles.prefSeparator]}>
                <View style={styles.prefLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={item.color} />
                  </View>
                  <Text style={styles.prefLabel} numberOfLines={1}>{item.label}</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.priorityInput}
                    keyboardType="numeric"
                    value={item.val}
                    onChangeText={item.set}
                    selectTextOnFocus
                  />
                  <Text style={styles.inputSub}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Macro Composition */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Macro Split</Text>
          </View>
          <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} style={styles.premiumCard}>

            {/* Macro Gauge */}
            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeBar}>
                <View style={[styles.gaugeSegment, { width: `${macroSplit.p}%`, backgroundColor: '#3B82F6' }]} />
                <View style={[styles.gaugeSegment, { width: `${macroSplit.c}%`, backgroundColor: '#FCD34D' }]} />
                <View style={[styles.gaugeSegment, { width: `${macroSplit.f}%`, backgroundColor: '#EF4444' }]} />
              </View>
              <View style={styles.gaugeLabels}>
                <Text style={[styles.gaugeLabelText, { color: '#3B82F6' }]}>{Math.round(macroSplit.p)}% PRO</Text>
                <Text style={[styles.gaugeLabelText, { color: '#FCD34D' }]}>{Math.round(macroSplit.c)}% CHO</Text>
                <Text style={[styles.gaugeLabelText, { color: '#EF4444' }]}>{Math.round(macroSplit.f)}% FAT</Text>
              </View>
            </View>

            {[
              { label: 'Protein', val: protein, set: setProtein, color: '#3B82F6', icon: 'fitness' },
              { label: 'Carbs', val: carbs, set: setCarbs, color: '#FCD34D', icon: 'leaf' },
              { label: 'Fats', val: fat, set: setFat, color: '#EF4444', icon: 'pizza' },
            ].map((item, idx) => (
              <View key={item.label} style={[styles.macroRow, idx > 0 && styles.prefSeparator]}>
                <View style={styles.prefLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={item.color} />
                  </View>
                  <Text style={styles.prefLabel}>{item.label}</Text>
                </View>
                <View style={styles.macroInputWrapper}>
                  <TextInput
                    style={[styles.macroInput, { color: item.color }]}
                    keyboardType="numeric"
                    value={item.val}
                    onChangeText={item.set}
                    selectTextOnFocus
                  />
                  <Text style={styles.inputSub}>G</Text>
                </View>
              </View>
            ))}
            <Button title="Save Everything" onPress={handleSaveTargets} disabled={isLoading} style={{ marginTop: 16 }} />
          </LinearGradient>
        </View>

        {/* App Info & Danger */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Details</Text>
          </View>
          <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} style={styles.premiumCard}>
            <View style={[styles.infoRow, { paddingBottom: 14 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Anabolic</Text>
                <Text style={styles.infoVersion}>v2.0</Text>
              </View>
              <TouchableOpacity onPress={checkForUpdates} disabled={isChecking} style={styles.updateBadge}>
                <Text style={styles.updateBadgeText}>{isChecking ? '...' : 'Update'}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.prefSeparator, { paddingTop: 14 }]}>
              <TouchableOpacity onPress={initiateClearData} style={styles.dangerAction}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.dangerActionText}>Purge All Data</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <Modal visible={isDeleteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dangerIconContainer}>
              <Ionicons name="warning-outline" size={28} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm Data Wipe</Text>
            <Text style={styles.modalText}>This cannot be undone. Enter code below:</Text>
            <Text style={styles.codeText}>{deleteCode}</Text>
            <TextInput
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={4}
              value={deleteInput}
              onChangeText={setDeleteInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button title="Back" variant="outline" onPress={() => setDeleteModalVisible(false)} style={{ flex: 1 }} />
              <View style={{ width: 10 }} />
              <Button title="Wipe" variant="danger" onPress={confirmClearData} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal visible={statusModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.statusBox}>
            <Ionicons
              name={statusModal.type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={48}
              color={statusModal.type === 'success' ? THEME.colors.primary : '#EF4444'}
            />
            <Text style={styles.statusTitle}>{statusModal.title}</Text>
            <Text style={styles.statusMsg}>{statusModal.message}</Text>
            <Button title="Dismiss" onPress={() => setStatusModal({ ...statusModal, visible: false })} style={{ width: '100%' }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: THEME.typography.black,
    fontSize: 32,
    letterSpacing: -1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  subtitle: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: THEME.spacing.sm,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  premiumCard: {
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  prefSeparator: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  prefLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefLabel: {
    flex: 1,
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.text,
    fontSize: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: THEME.roundness.md,
    padding: 2,
    minWidth: 100,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.roundness.sm,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  segmentText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 10,
  },
  segmentTextActive: {
    color: THEME.colors.background,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  priorityInput: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 20,
    textAlign: 'right',
  },
  inputSub: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 11,
    opacity: 0.4,
  },
  gaugeContainer: {
    marginBottom: 20,
    marginTop: 2,
  },
  gaugeBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  gaugeSegment: {
    height: '100%',
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeLabelText: {
    fontFamily: THEME.typography.black,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  macroInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
    justifyContent: 'flex-end',
  },
  macroInput: {
    fontFamily: THEME.typography.black,
    fontSize: 22,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 16,
  },
  infoVersion: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  updateBadge: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.roundness.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  updateBadgeText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 11,
  },
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  dangerActionText: {
    fontFamily: THEME.typography.bold,
    color: '#EF4444',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  dangerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 22,
    marginBottom: 4,
  },
  modalText: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  codeText: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.primary,
    fontSize: 40,
    letterSpacing: 10,
    marginBottom: 20,
  },
  codeInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    width: '60%',
    textAlign: 'center',
    fontSize: 28,
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
  },
  statusBox: {
    backgroundColor: THEME.colors.surface,
    width: '85%',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statusTitle: {
    fontFamily: THEME.typography.black,
    fontSize: 24,
    color: THEME.colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  statusMsg: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});
