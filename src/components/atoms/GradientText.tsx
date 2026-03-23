import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

interface GradientTextProps extends TextProps {
  colors?: string[];
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  colors = [THEME.colors.primary, THEME.colors.accent], 
  style, 
  ...props 
}) => {
  return (
    <MaskedView
      maskElement={
        <Text {...props} style={[style, { backgroundColor: 'transparent' }]} />
      }
    >
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text {...props} style={[style, { opacity: 0 }]} />
      </LinearGradient>
    </MaskedView>
  );
};
