import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useMetrics } from '../../context/MetricsContext';
import { Button } from '../atoms/Button';

export const ProgressGallery: React.FC = React.memo(() => {
  const { metrics, addProgressPhoto, deleteProgressPhoto } = useMetrics();
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pickImage = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await addProgressPhoto(result.assets[0].uri, new Date().toISOString());
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to pick image.');
    } finally {
      setLoading(false);
    }
  }, [addProgressPhoto]);

  const formatDate = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteId) {
      await deleteProgressPhoto(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteProgressPhoto]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Canvas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={pickImage} disabled={loading}>
          <Ionicons name="camera" size={20} color={THEME.colors.background} />
          <Text style={styles.addBtnText}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      {metrics.progressPhotos && metrics.progressPhotos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
          {metrics.progressPhotos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => setDeleteId(photo.id)}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
              <View style={styles.dateOverlay}>
                <Text style={styles.dateText}>{formatDate(photo.date)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color={THEME.colors.textMuted} />
          <Text style={styles.emptyText}>No progress photos yet.</Text>
          <Text style={styles.emptySubtext}>Snap a pic to start visually tracking your journey.</Text>
        </View>
      )}

      {/* Premium Delete Modal */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.alertIcon}>
              <Ionicons name="trash-outline" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Photo?</Text>
            <Text style={styles.modalText}>This will permanently remove this progress photo from your history.</Text>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setDeleteId(null)} style={{ flex: 1 }} />
              <View style={{ width: 12 }} />
              <Button 
                title="Delete" 
                variant="danger" 
                onPress={handleDeleteConfirm} 
                style={{ flex: 1 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.typography.bold,
    fontSize: 20,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  addBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addBtnText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.background,
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 16,
    marginTop: THEME.spacing.sm,
  },
  emptySubtext: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: THEME.spacing.xs,
    textAlign: 'center',
  },
  gallery: {
    paddingRight: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  photoCard: {
    width: 200,
    height: 300,
    borderRadius: THEME.roundness.md,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: THEME.spacing.sm,
    alignItems: 'center',
  },
  dateText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.text,
    fontSize: 12,
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
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
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  alertIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  modalTitle: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 22,
    marginBottom: 8,
  },
  modalText: {
    fontFamily: THEME.typography.medium,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
  },
});
