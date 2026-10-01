import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarScreen } from '../screens/CalendarScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { Icon, IconName, LogoMark } from '../components/Icon';
import { useAppData } from '../context/AppContext';
import { useI18n } from '../i18n';
import { colors, fonts, spacing, useLayout } from '../theme/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, IconName> = {
  Calendar: 'calendar',
  Statistics: 'chart',
  Settings: 'settings',
};

/** Sidebar on wide screens, bottom bar on phones and tablets. */
function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const items = state.routes.map((route, index) => {
    const focused = state.index === index;
    const label = (descriptors[route.key].options.title ?? route.name) as string;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return { key: route.key, name: route.name, focused, label, onPress };
  });

  if (isWide) {
    return (
      <View style={[styles.sidebar, { paddingTop: insets.top + 28 }]}>
        <View style={styles.brand}>
          <LogoMark size={30} />
          <Text style={styles.wordmark}>
            Period<Text style={{ color: colors.periodDay }}>.</Text>
          </Text>
        </View>
        <View accessibilityRole="tablist" style={styles.sideNav}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: item.focused }}
              onPress={item.onPress}
              style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [
                styles.sideItem,
                hovered && !item.focused && styles.sideItemHover,
                item.focused && styles.sideItemActive,
              ]}
            >
              <Icon name={TAB_ICONS[item.name]} size={20} color={item.focused ? colors.white : colors.textMuted} />
              <Text style={[styles.sideLabel, item.focused && styles.sideLabelActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.sideFooter}>
          <Icon name="bell" size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.sideFooterText}>{t.settings.notificationsHint}</Text>
        </View>
      </View>
    );
  }

  return (
    <View accessibilityRole="tablist" style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: item.focused }}
          onPress={item.onPress}
          style={styles.bottomItem}
        >
          <View style={[styles.bottomIcon, item.focused && styles.bottomIconActive]}>
            <Icon name={TAB_ICONS[item.name]} size={22} color={item.focused ? colors.ink : colors.textMuted} />
          </View>
          <Text style={[styles.bottomLabel, item.focused && styles.bottomLabelActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MainTabs() {
  const { t } = useI18n();
  const { isWide } = useLayout();
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isWide ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: colors.background },
      }}
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

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.text,
  },
  sideNav: {
    gap: 4,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  sideItemHover: {
    backgroundColor: colors.primaryLight,
  },
  sideItemActive: {
    backgroundColor: colors.ink,
  },
  sideLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textMuted,
  },
  sideLabelActive: {
    color: colors.white,
  },
  sideFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: '#F7EEF2',
  },
  sideFooterText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minHeight: 48,
  },
  bottomIcon: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIconActive: {
    backgroundColor: colors.primaryLight,
  },
  bottomLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomLabelActive: {
    color: colors.ink,
  },
});
