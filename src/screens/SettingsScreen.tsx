import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { THEME } from '../constants/theme';
import { Button } from '../components/atoms/Button';
import { storage } from '../services/storage';
import { useMetrics } from '../context/MetricsContext';
import { GradientText } from '../components/atoms/GradientText';

export const SettingsScreen: React.FC = () => {
  const { metrics, isLoading, simulateData, setCalorieGoal, setWaterGoal, setTargetWeight, updateWater, updateMacros, updatePreferences, updateAge, updateGender } = useMetrics();

  const currentPrefs = metrics.preferences || { weight: 'kg', height: 'cm', body: 'cm', fluid: 'ml' };

  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('https://api.github.com/repos/acedmicabhishek/Anabolic/releases');
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      const releases = await response.json();
      
      if (!releases || releases.length === 0) {
        showStatus('Update Status', 'No new versions found on store.', 'success');
        return;
      }

      const latestRelease = releases[0];
      const latestVersionNum = parseFloat(latestRelease.name || latestRelease.tag_name);
      const currentVersionNum = 1.0;

      if (isNaN(latestVersionNum)) {
        showStatus('Update Status', 'Could not parse version. Please check GitHub manually.', 'error');
      } else if (latestVersionNum > currentVersionNum) {
        showStatus('Update Available!', `Version ${latestVersionNum} is available. Visit GitHub to update.`, 'success');
      } else {
        showStatus('Update Status', 'Your app is up to date!', 'success');
      }
    } catch (error) {
      console.error(error);
      showStatus('Error', 'Failed to check for updates. ' + (error as Error).message, 'error');
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
    visible: false,
    title: '',
    message: '',
    type: 'success'
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
    showStatus('Saved', 'Nutrition targets updated successfully.');
  };

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
      showStatus('Data Cleared', 'Please restart the app for changes to take effect.');
    } else {
      showStatus('Incorrect Code', 'The code you entered does not match.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="flash" size={24} color={THEME.colors.primary} />
            <GradientText style={styles.title}>Settings</GradientText>
          </View>
          <Text style={styles.subtitle}>Configure your experience</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Measurement Units</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Weight</Text>
              <View style={styles.toggleContainer}>
                {['kg', 'lb'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.toggleBtn, currentPrefs.weight === u && styles.toggleBtnActive]}
                    onPress={() => updatePreferences({ weight: u as any })}
                  >
                    <Text style={[styles.toggleText, currentPrefs.weight === u && styles.toggleTextActive]}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Height</Text>
              <View style={styles.toggleContainer}>
                {['cm', 'ft'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.toggleBtn, currentPrefs.height === u && styles.toggleBtnActive]}
                    onPress={() => updatePreferences({ height: u as any })}
                  >
                    <Text style={[styles.toggleText, currentPrefs.height === u && styles.toggleTextActive]}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Body Parts</Text>
              <View style={styles.toggleContainer}>
                {['cm', 'inch'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.toggleBtn, currentPrefs.body === u && styles.toggleBtnActive]}
                    onPress={() => updatePreferences({ body: u as any })}
                  >
                    <Text style={[styles.toggleText, currentPrefs.body === u && styles.toggleTextActive]}>{u === 'inch' ? 'IN' : 'CM'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Water</Text>
              <View style={styles.toggleContainer}>
                {['ml', 'oz'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.toggleBtn, currentPrefs.fluid === u && styles.toggleBtnActive]}
                    onPress={() => updatePreferences({ fluid: u as any })}
                  >
                    <Text style={[styles.toggleText, currentPrefs.fluid === u && styles.toggleTextActive]}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Nutrition Targets</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={calGoal} onChangeText={setCalGoal} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Protein (g)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={protein} onChangeText={setProtein} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Carbs (g)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={carbs} onChangeText={setCarbs} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Fat (g)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={fat} onChangeText={setFat} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Water (ml)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={waterGoal} onChangeText={setWGoal} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Target Weight ({metrics.preferences.weight})</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={targetWeightValue} onChangeText={setTargetWeightValue} />
            </View>
            <Button title="Save Targets" onPress={handleSaveTargets} disabled={isLoading} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>App Info</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.infoText}>Anabolic v1.0</Text>
            <Button 
              title={isChecking ? "Checking..." : "Check for Updates"} 
              variant="outline" 
              onPress={checkForUpdates} 
              disabled={isChecking || isLoading}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>

        {/* Developer Options Hidden */}
        {/*
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Options</Text>
          <View style={[styles.card, styles.devCard]}>
            <Text style={styles.cardText}>Populate local storage with 30 days of randomized realistic data for testing Analytics.</Text>
            <Button
              title="Simulate 30-Day Data"
              variant="outline"
              onPress={async () => {
                await simulateData();
                showStatus('Simulation Complete', 'Charts have been updated.');
              }}
              disabled={isLoading}
            />
          </View>
        </View>
        */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
          </View>
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.cardText}>Delete all local tracking data and user preferences. This action cannot be undone.</Text>
            <Button
              title="Clear All Data"
              variant="danger"
              onPress={initiateClearData}
              disabled={isLoading}
            />
          </View>
        </View>

      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#EF4444' }]}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              To verify you want to delete all data, please type the following randomly generated 4-digit code:
            </Text>
            <Text style={styles.codeDisplay}>{deleteCode}</Text>
            
            <TextInput
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={4}
              value={deleteInput}
              onChangeText={setDeleteInput}
              placeholder="0000"
              placeholderTextColor="rgba(255,255,255,0.2)"
              autoFocus
            />

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setDeleteModalVisible(false)} style={{ flex: 1 }} />
              <View style={{ width: THEME.spacing.md }} />
              <Button title="Delete" variant="danger" onPress={confirmClearData} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Generic Status Modal */}
      <Modal
        visible={statusModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModal({ ...statusModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusContent}>
            <View style={[styles.statusIcon, { backgroundColor: statusModal.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons 
                name={statusModal.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={48} 
                color={statusModal.type === 'success' ? THEME.colors.primary : '#EF4444'} 
              />
            </View>
            <Text style={[styles.modalTitle, { color: statusModal.type === 'success' ? THEME.colors.text : '#EF4444' }]}>{statusModal.title}</Text>
            <Text style={styles.modalText}>{statusModal.message}</Text>
            <Button 
              title="OK" 
              onPress={() => setStatusModal({ ...statusModal, visible: false })} 
              style={{ width: '100%' }} 
            />
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
    padding: THEME.spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: THEME.spacing.xl,
    marginTop: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.typography.black,
    fontSize: 28,
    color: THEME.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: THEME.typography.medium,
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.roundness.lg,
  },
  cardText: {
    fontFamily: THEME.typography.regular,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginBottom: THEME.spacing.lg,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.text,
    fontSize: 16,
  },
  input: {
    backgroundColor: THEME.colors.surfaceSecondary,
    color: THEME.colors.text,
    fontFamily: THEME.typography.bold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.roundness.md,
    width: 100,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.text,
    fontSize: 16,
    marginBottom: THEME.spacing.xs,
  },
  devCard: {
    borderColor: THEME.colors.primary,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  preferenceLabel: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.text,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.md,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.roundness.sm,
  },
  toggleBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  toggleText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  toggleTextActive: {
    color: THEME.colors.background,
  },
  dangerCard: {
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  modalTitle: {
    fontFamily: THEME.typography.black,
    color: '#EF4444',
    fontSize: 24,
    marginBottom: THEME.spacing.md,
  },
  modalText: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
    lineHeight: 20,
  },
  codeDisplay: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 32,
    letterSpacing: 8,
    marginBottom: THEME.spacing.lg,
  },
  codeInput: {
    backgroundColor: THEME.colors.surfaceSecondary,
    color: THEME.colors.text,
    fontFamily: THEME.typography.bold,
    fontSize: 24,
    padding: THEME.spacing.md,
    borderRadius: THEME.roundness.md,
    width: '60%',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: THEME.spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
  },
  statusContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.xl,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
});
