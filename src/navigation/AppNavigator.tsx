import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useMetrics } from '../context/MetricsContext';

import { DietScreen } from '../screens/DietScreen';
import { MetricsScreen } from '../screens/MetricsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LogMetricModal } from '../components/organisms/LogMetricModal';

const Tab = createBottomTabNavigator();


const DummyScreen = () => null;

interface CustomTabBarButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
}

const CustomTabBarButton = ({ children, onPress }: CustomTabBarButtonProps) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={styles.customButton}>
      <Ionicons name="add" size={32} color="#000" />
    </View>
  </TouchableOpacity>
);

export const AppNavigator = () => {
  const { isLogModalVisible, closeLogModal, openLogModal } = useMetrics();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: THEME.colors.surface,
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
          },
          tabBarActiveTintColor: THEME.colors.primary,
          tabBarInactiveTintColor: THEME.colors.textMuted,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

            if (route.name === 'Diet') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'Metrics') {
              iconName = focused ? 'scale' : 'scale-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={28} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Diet" component={DietScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen 
          name="Add" 
          component={DummyScreen} 
          options={{
            tabBarIcon: () => null,
            tabBarButton: (props) => (
              <CustomTabBarButton {...props} onPress={openLogModal} />
            )
          }}
        />
        <Tab.Screen name="Metrics" component={MetricsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>

      <LogMetricModal 
        visible={isLogModalVisible} 
        onClose={closeLogModal} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  }
});
