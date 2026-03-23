import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { MetricsProvider } from './context/MetricsContext';
import { RootNavigator } from './navigation/RootNavigator';
import { THEME } from './constants/theme';
import { View, Text } from 'react-native';

import { useFonts } from 'expo-font';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.colors.background,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'FiraCode_400Regular': require('../assets/FiraCode-VariableFont_wght.ttf'),
    'FiraCode_500Medium': require('../assets/FiraCode-VariableFont_wght.ttf'),
    'FiraCode_600SemiBold': require('../assets/FiraCode-VariableFont_wght.ttf'),
    'FiraCode_700Bold': require('../assets/FiraCode-VariableFont_wght.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MetricsProvider>
      <NavigationContainer theme={MyTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="light" />
    </MetricsProvider>
  );
}

