import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { THEME } from '../../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle
}) => {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  const buttonStyles = [
    styles.base,
    styles[size],
    isOutline && styles.outline,
    isDanger && styles.danger,
    isSecondary && styles.secondary,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`text_${size}` as keyof typeof styles],
    isOutline && styles.textOutline,
    isDanger && styles.textDanger,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? THEME.colors.primary : '#fff'} />
      ) : (
        <Text style={textStyles as TextStyle[]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: THEME.roundness.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondary: {
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  danger: {
    backgroundColor: THEME.colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  textBase: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 18 },
  textOutline: {
    color: THEME.colors.primary,
  },
  textDanger: {
    color: '#fff',
  },
});
