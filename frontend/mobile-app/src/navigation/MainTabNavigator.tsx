import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from '../screens/DashboardScreen';
import { FinancingScreen } from '../screens/FinancingScreen';
import { GuaranteesScreen } from '../screens/GuaranteesScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PurchaseOrdersScreen } from '../screens/PurchaseOrdersScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen
        name="PurchaseOrders"
        component={PurchaseOrdersScreen}
        options={{ title: 'Purchase Orders' }}
      />
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Invoices' }} />
      <Tab.Screen name="Financing" component={FinancingScreen} options={{ title: 'Financing' }} />
      <Tab.Screen name="Guarantees" component={GuaranteesScreen} options={{ title: 'Guarantees' }} />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
