import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarScreen } from '../screens/CalendarScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useAppData } from '../context/AppContext';
import { useI18n } from '../i18n';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Calendar: '📅',
  Statistics: '📊',
  Settings: '⚙️',
};

function MainTabs() {
  const { t } = useI18n();
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
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: t.tabs.calendar }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: t.tabs.statistics }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t.tabs.settings }} />
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
