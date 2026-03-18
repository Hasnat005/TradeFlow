import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreatePurchaseOrderScreen, OrderDetailScreen, PurchaseOrdersScreen } from '../screens';
import { OrdersStackParamList } from './types';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrdersDashboard" component={PurchaseOrdersScreen} options={{ title: 'Orders' }} />
      <Stack.Screen
        name="CreatePurchaseOrder"
        component={CreatePurchaseOrderScreen}
        options={{ title: 'New Purchase Order' }}
      />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
    </Stack.Navigator>
  );
}
