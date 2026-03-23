import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { MetricsProvider } from './context/MetricsContext';
import { RootNavigator } from './navigation/RootNavigator';
import { THEME } from './constants/theme';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { View, Text } from 'react-native';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.colors.background,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
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

