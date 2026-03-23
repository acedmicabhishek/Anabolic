import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';

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


  const [foodData, setFoodData] = useState<{ name: string, calories: number, macros: { protein: number, carbs: number, fat: number } } | null>(null);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setFoodData(null);
      setLoading(false);
    }
  }, [visible]);

  if (!permission) return <View />;

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const result = await response.json();

      if (result.status === 1 && result.product) {
        const prod = result.product;
        const nutriments = prod.nutriments || {};

        const name = prod.product_name || 'Unknown Food';
        const kcal = nutriments['energy-kcal_100g'] || 0;
        const protein = nutriments['proteins_100g'] || 0;
        const carbs = nutriments['carbohydrates_100g'] || 0;
        const fat = nutriments['fat_100g'] || 0;

        setFoodData({
          name,
          calories: Math.round(kcal),
          macros: {
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat)
          }
        });
      } else {
        setScannerStatus({ message: 'Barcode Not Found', type: 'error' });
        setTimeout(() => setScannerStatus(null), 3000);
        setScanned(false);
      }
    } catch (e) {
      setScannerStatus({ message: 'Network Error', type: 'error' });
      setTimeout(() => setScannerStatus(null), 3000);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmAndSave = async () => {
    if (foodData) {
      await addMealEntry(targetMeal, foodData.calories, undefined, foodData.name, foodData.macros);
      setScannerStatus({ message: 'Food Logged!', type: 'success' });
      setTimeout(() => {
        setScannerStatus(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={THEME.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Food</Text>
          <View style={{ width: 44 }} />
        </View>

        {!permission.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>We need your permission to show the camera</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {!foodData && (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
            )}

            {scannerStatus && (
              <View style={[styles.statusOverlay, { backgroundColor: scannerStatus.type === 'success' ? 'rgba(52, 211, 153, 0.9)' : 'rgba(239, 68, 68, 0.9)' }]}>
                <Ionicons name={scannerStatus.type === 'success' ? 'checkmark-circle' : 'alert-circle'} size={32} color="#FFF" />
                <Text style={styles.statusText}>{scannerStatus.message}</Text>
              </View>
            )}

            {loading && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>Fetching macros mapping...</Text>
              </View>
            )}

            {foodData && !loading && (
              <View style={styles.resultContainer}>
                <View style={styles.resultCard}>
                  <Text style={styles.foodName}>{foodData.name}</Text>
                  <Text style={styles.servingText}>Values per 100g</Text>

                  <View style={styles.macroRow}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{foodData.calories}</Text>
                      <Text style={styles.macroLabel}>kcal</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{foodData.macros.protein}g</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{foodData.macros.carbs}g</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{foodData.macros.fat}g</Text>
                      <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => { setScanned(false); setFoodData(null); }}>
                      <Text style={styles.cancelBtnText}>Rescan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={confirmAndSave}>
                      <Text style={styles.saveBtnText}>Log to {targetMeal}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {!foodData && !loading && (
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerTarget} />
                <Text style={styles.scannerText}>Point at a barcode</Text>
              </View>
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
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontFamily: THEME.typography.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.roundness.md,
  },
  permissionButtonText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.background,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTarget: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    borderRadius: THEME.roundness.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scannerText: {
    fontFamily: THEME.typography.bold,
    color: '#FFF',
    marginTop: 20,
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: THEME.typography.semiBold,
    color: THEME.colors.text,
    marginTop: 16,
  },
  resultContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  resultCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.xl,
    alignItems: 'center',
  },
  foodName: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  servingText: {
    fontFamily: THEME.typography.regular,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginBottom: THEME.spacing.xl,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: THEME.spacing.xxl,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.primary,
    fontSize: 20,
  },
  macroLabel: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: THEME.roundness.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.text,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: THEME.roundness.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.background,
  },
  statusOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: THEME.roundness.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 100,
  },
  statusText: {
    color: '#FFF',
    fontFamily: THEME.typography.bold,
    fontSize: 16,
  },
});
