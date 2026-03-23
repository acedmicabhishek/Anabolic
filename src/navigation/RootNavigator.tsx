import React from 'react';
import { useMetrics } from '../context/MetricsContext';
import { AppNavigator } from './AppNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';

export const RootNavigator = () => {
  const { metrics, isLoading } = useMetrics();

  if (isLoading) return null; 

  if (!metrics.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return <AppNavigator />;
};
