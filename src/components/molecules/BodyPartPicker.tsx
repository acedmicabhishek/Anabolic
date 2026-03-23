import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { THEME } from '../../constants/theme';
import { BODY_PARTS, BodyPart } from '../../types/metrics';

interface BodyPartPickerProps {
  selectedPart: string;
  onSelect: (part: BodyPart) => void;
}

export const BodyPartPicker: React.FC<BodyPartPickerProps> = ({ selectedPart, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Body Part</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BODY_PARTS.map((part) => {
          const isSelected = selectedPart === part;
          return (
            <TouchableOpacity
              key={part}
              onPress={() => onSelect(part)}
              style={[
                styles.chip,
                isSelected && styles.selectedChip
              ]}
            >
              <Text style={[
                styles.chipText,
                isSelected && styles.selectedChipText
              ]}>
                {part}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.md,
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: THEME.spacing.sm,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  chip: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.roundness.md,
    marginRight: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedChip: {
    backgroundColor: THEME.colors.primary + '20',
    borderColor: THEME.colors.primary,
  },
  chipText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedChipText: {
    color: THEME.colors.primary,
  },
});
