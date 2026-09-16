import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarScreen } from '../screens/CalendarScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Takvim: '📅',
  İstatistik: '📊',
  Ayarlar: '⚙️',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Takvim" component={CalendarScreen} />
      <Tab.Screen name="İstatistik" component={StatisticsScreen} />
      <Tab.Screen name="Ayarlar" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { loading, settings } = useAppData();

  if (loading) return null;

  return (
    <NavigationContainer>
      {settings.onboardingComplete ? <MainTabs /> : <OnboardingScreen />}
    </NavigationContainer>
  );
}
