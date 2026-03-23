import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { BODY_PARTS, BodyPart } from '../../types/metrics';

const BODY_ICONS: Record<BodyPart, string> = {
  'Biceps': 'fitness',
  'Waist': 'body',
  'Chest': 'shirt',
  'Clavicle': 'man',
  'Shoulders': 'accessibility',
  'Quads': 'walk',
  'Calves': 'footsteps',
};

interface BodyPartPickerProps {
  selectedPart: string;
  onSelect: (part: BodyPart) => void;
}

export const BodyPartPicker: React.FC<BodyPartPickerProps> = ({ selectedPart, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SELECT MUSCLE GROUP</Text>
      <View style={styles.grid}>
        {BODY_PARTS.map((part) => {
          const isSelected = selectedPart === part;
          const iconName = BODY_ICONS[part] || 'body';
          return (
            <TouchableOpacity
              key={part}
              onPress={() => onSelect(part)}
              style={[
                styles.chip,
                isSelected && styles.selectedChip
              ]}
            >
              <View style={[styles.iconWrapper, isSelected && styles.selectedIconWrapper]}>
                <Ionicons 
                  name={iconName as keyof typeof Ionicons.glyphMap} 
                  size={18} 
                  color={isSelected ? THEME.colors.background : 'rgba(255,255,255,0.3)'} 
                />
              </View>
              <Text style={[
                styles.chipText,
                isSelected && styles.selectedChipText
              ]}>
                {part}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  label: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.textMuted,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: THEME.spacing.md,
    marginLeft: 4,
    opacity: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconWrapper: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  chipText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  selectedChipText: {
    color: THEME.colors.background,
    fontFamily: THEME.typography.black,
  },
});
