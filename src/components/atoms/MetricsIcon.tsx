import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const MetricsIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = '#34D399' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 20V10" />
    <Path d="M12 20V4" />
    <Path d="M6 20V14" />
  </Svg>
);
