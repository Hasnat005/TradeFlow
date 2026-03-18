import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FinancingDetailScreen, FinancingRequestScreen, FinancingScreen } from '../screens';
import { FinancingStackParamList } from './types';

const Stack = createNativeStackNavigator<FinancingStackParamList>();

export function FinancingStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FinancingDashboard" component={FinancingScreen} options={{ title: 'Financing' }} />
      <Stack.Screen name="FinancingRequest" component={FinancingRequestScreen} options={{ title: 'Request Financing' }} />
      <Stack.Screen name="FinancingDetail" component={FinancingDetailScreen} options={{ title: 'Financing Detail' }} />
    </Stack.Navigator>
  );
}
