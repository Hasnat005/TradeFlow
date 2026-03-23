import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InvoicesStackNavigator } from './InvoicesStackNavigator';
import { FinancingStackNavigator } from './FinancingStackNavigator';
import { OrdersStackNavigator } from './OrdersStackNavigator';
import { useAppTheme } from '../hooks/useAppTheme';
import { DashboardOverviewScreen } from '../screens/DashboardOverviewScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const tabBarTopPadding = 8;
  const tabBarBottomPadding = insets.bottom + 12;
  const tabBarHeight = 52 + tabBarTopPadding + tabBarBottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: tabBarHeight,
          paddingBottom: tabBarBottomPadding,
          paddingTop: tabBarTopPadding,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabel: ({ color, focused }) => (
          <Text style={{ color, fontSize: 12, fontWeight: focused ? '700' : '500' }}>
            {route.name}
          </Text>
        ),
        tabBarIcon: ({ color, size, focused }) => {
          const outlineIconByRoute: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            Invoices: 'document-text-outline',
            Financing: 'cash-outline',
            Orders: 'receipt-outline',
            Profile: 'person-outline',
          };

          const filledIconByRoute: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid',
            Invoices: 'document-text',
            Financing: 'cash',
            Orders: 'receipt',
            Profile: 'person',
          };

          return (
            <View style={styles.iconWrap}>
              {focused ? <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} /> : null}
              <Ionicons
                name={focused ? filledIconByRoute[route.name] : outlineIconByRoute[route.name]}
                size={size ?? 24}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardOverviewScreen} />
      <Tab.Screen name="Invoices" component={InvoicesStackNavigator} />
      <Tab.Screen name="Financing" component={FinancingStackNavigator} />
      <Tab.Screen name="Orders" component={OrdersStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tabBarItem: {
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    top: -9,
    width: 24,
    height: 3,
    borderRadius: 999,
  },
});
