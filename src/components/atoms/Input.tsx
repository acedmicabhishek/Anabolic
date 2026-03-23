import React from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle 
} from 'react-native';
import { THEME } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  containerStyle, 
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={THEME.colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
    width: '100%',
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: THEME.spacing.xs,
    marginLeft: 4,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    color: THEME.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputError: {
    borderColor: THEME.colors.error,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: 12,
    marginTop: THEME.spacing.xs,
    marginLeft: 4,
  },
});
