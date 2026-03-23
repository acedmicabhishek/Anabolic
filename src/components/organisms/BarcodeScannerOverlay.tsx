import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput, Animated, Easing, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_AREA_SIZE = 280;

interface BarcodeScannerOverlayProps {
  visible: boolean;
  onClose: () => void;
  targetMeal: string;
}

export const BarcodeScannerOverlay: React.FC<BarcodeScannerOverlayProps> = ({ visible, onClose, targetMeal }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const { addMealEntry } = useMetrics();

  const [foodData, setFoodData] = useState<{ 
    name: string, 
    caloriesPer100: number, 
    macrosPer100: { protein: number, carbs: number, fat: number },
    brand?: string
  } | null>(null);
  
  const [consumedAmount, setConsumedAmount] = useState<string>('100');
  
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setFoodData(null);
      setLoading(false);
      setConsumedAmount('100');
      startScanAnimation();
    }
  }, [visible]);

  useEffect(() => {
    if (foodData) {
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      cardSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [foodData]);

  const startScanAnimation = () => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  if (!permission) return <View />;

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const result = await response.json();

      if (result.status === 1 && result.product) {
        const prod = result.product;
        const nutriments = prod.nutriments || {};

        const name = prod.product_name || 'Unknown Food';
        const brand = prod.brands || '';
        const kcal = nutriments['energy-kcal_100g'] || 0;
        const protein = nutriments['proteins_100g'] || 0;
        const carbs = nutriments['carbohydrates_100g'] || 0;
        const fat = nutriments['fat_100g'] || 0;

        setFoodData({
          name,
          brand,
          caloriesPer100: kcal,
          macrosPer100: {
            protein,
            carbs,
            fat
          }
        });
      } else {
        setScannerStatus({ message: 'Barcode Not Found', type: 'error' });
        setTimeout(() => {
            setScannerStatus(null);
            setScanned(false);
        }, 2000);
      }
    } catch (e) {
      setScannerStatus({ message: 'Network Error', type: 'error' });
      setTimeout(() => {
        setScannerStatus(null);
        setScanned(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const confirmAndSave = async () => {
    if (foodData) {
      const amount = parseFloat(consumedAmount) || 0;
      if (amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid weight in grams.');
        return;
      }

      const ratio = amount / 100;
      const scaledCalories = Math.round(foodData.caloriesPer100 * ratio);
      const scaledMacros = {
        protein: Math.round(foodData.macrosPer100.protein * ratio),
        carbs: Math.round(foodData.macrosPer100.carbs * ratio),
        fat: Math.round(foodData.macrosPer100.fat * ratio),
      };

      await addMealEntry(targetMeal, scaledCalories, undefined, foodData.name, scaledMacros);
      setScannerStatus({ message: 'Logged successfully!', type: 'success' });
      
      setTimeout(() => {
        setScannerStatus(null);
        onClose();
      }, 1500);
    }
  };

  const currentAmount = parseFloat(consumedAmount) || 0;
  const ratio = currentAmount / 100;
  const displayCals = Math.round((foodData?.caloriesPer100 || 0) * ratio);
  const displayProtein = Math.round((foodData?.macrosPer100.protein || 0) * ratio);
  const displayCarbs = Math.round((foodData?.macrosPer100.carbs || 0) * ratio);
  const displayFat = Math.round((foodData?.macrosPer100.fat || 0) * ratio);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.container}>
        {!permission.granted ? (
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color={THEME.colors.primary} />
            <Text style={styles.permissionText}>Camera access is required to scan products</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
              <Text style={{ color: THEME.colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Scanner Overlay UI */}
            <View style={styles.scannerOverlay}>
              <View style={styles.topMask} />
              <View style={styles.middleRow}>
                <View style={styles.sideMask} />
                <View style={styles.scanZone}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    
                    <Animated.View 
                        style={[
                            styles.scanLine, 
                            { 
                                transform: [{ 
                                    translateY: scanLineAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, SCAN_AREA_SIZE]
                                    }) 
                                }] 
                            }
                        ]} 
                    >
                        <LinearGradient
                            colors={['transparent', THEME.colors.primary, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>
                <View style={styles.sideMask} />
              </View>
              <View style={styles.bottomMask}>
                <Text style={styles.scannerText}>Align barcode within the frame</Text>
              </View>
            </View>

            {/* Back Button */}
            <TouchableOpacity onPress={onClose} style={styles.backFab}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>Fetching nutrition data...</Text>
              </View>
            )}

            {scannerStatus && (
              <Animated.View style={[styles.statusBanner, { backgroundColor: scannerStatus.type === 'success' ? THEME.colors.success : THEME.colors.error }]}>
                <Ionicons name={scannerStatus.type === 'success' ? 'checkmark-circle' : 'alert-circle'} size={24} color="#000" />
                <Text style={styles.statusText}>{scannerStatus.message}</Text>
              </Animated.View>
            )}

            {foodData && !loading && (
              <Animated.View style={[styles.resultOverlay, { transform: [{ translateY: cardSlideAnim }] }]}>
                <View style={styles.resultCard}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.brandName}>{foodData.brand || 'General Product'}</Text>
                        <Text style={styles.foodName} numberOfLines={1}>{foodData.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { setScanned(false); setFoodData(null); }} style={styles.rescanIcon}>
                        <Ionicons name="refresh" size={20} color={THEME.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Weight consumed</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.amountInput}
                                value={consumedAmount}
                                onChangeText={setConsumedAmount}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={THEME.colors.textMuted}
                                autoFocus
                            />
                            <Text style={styles.unitText}>grams</Text>
                        </View>
                    </View>
                    
                    <View style={styles.summaryLabelContainer}>
                        <Text style={styles.summaryLabel}>Nutritional Summary</Text>
                    </View>
                  </View>

                  <View style={styles.macroGrid}>
                    <View style={styles.mainKcal}>
                        <Text style={styles.kcalValue}>{displayCals}</Text>
                        <Text style={styles.kcalLabel}>kcal</Text>
                    </View>
                    
                    <View style={styles.macroDetails}>
                        <View style={styles.macroMiniCard}>
                            <View style={[styles.macroIndicator, { backgroundColor: '#FF6B6B' }]} />
                            <Text style={styles.miniMacroValue}>{displayProtein}g</Text>
                            <Text style={styles.miniMacroLabel}>Protein</Text>
                        </View>
                        <View style={styles.macroMiniCard}>
                            <View style={[styles.macroIndicator, { backgroundColor: '#4DABF7' }]} />
                            <Text style={styles.miniMacroValue}>{displayCarbs}g</Text>
                            <Text style={styles.miniMacroLabel}>Carbs</Text>
                        </View>
                        <View style={styles.macroMiniCard}>
                            <View style={[styles.macroIndicator, { backgroundColor: '#FCC419' }]} />
                            <Text style={styles.miniMacroValue}>{displayFat}g</Text>
                            <Text style={styles.miniMacroLabel}>Fat</Text>
                        </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.saveBtn} onPress={confirmAndSave}>
                      <Text style={styles.saveBtnText}>Log to {targetMeal}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: THEME.colors.background,
  },
  permissionText: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: THEME.roundness.xl,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    fontFamily: THEME.typography.bold,
    color: '#000',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
  },
  backFab: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanZone: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: THEME.colors.primary,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanLine: {
    width: '100%',
    height: 2,
    position: 'absolute',
    zIndex: 2,
  },
  scannerText: {
    fontFamily: THEME.typography.medium,
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: THEME.typography.semiBold,
    color: '#FFF',
    marginTop: 16,
  },
  statusBanner: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: THEME.roundness.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statusText: {
    color: '#000',
    fontFamily: THEME.typography.bold,
    fontSize: 15,
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.md,
    zIndex: 1000,
  },
  resultCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 32,
    padding: THEME.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandName: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  foodName: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.text,
    fontSize: 22,
    marginTop: 2,
  },
  rescanIcon: {
    padding: 8,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: 12,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: 20,
    padding: 16,
  },
  inputLabel: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInput: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.primary,
    fontSize: 32,
    padding: 0,
  },
  unitText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 16,
    marginLeft: 8,
  },
  summaryLabelContainer: {
    marginTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3441',
  },
  summaryLabel: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  macroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
    marginTop: 10,
  },
  mainKcal: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#2A3441',
  },
  kcalValue: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 40,
  },
  kcalLabel: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginTop: -4,
  },
  macroDetails: {
    flex: 1.5,
    paddingLeft: 20,
    gap: 12,
  },
  macroMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  miniMacroValue: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.text,
    fontSize: 16,
    minWidth: 40,
  },
  miniMacroLabel: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  actionRow: {
    width: '100%',
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: THEME.typography.bold,
    color: '#000',
    fontSize: 16,
  },
});
