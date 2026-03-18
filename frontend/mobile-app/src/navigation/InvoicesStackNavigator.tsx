import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateInvoiceScreen } from '../screens/CreateInvoiceScreen';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { InvoicesStackParamList } from './types';

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="InvoiceList" component={InvoicesScreen} options={{ title: 'Invoices' }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Invoice Details' }} />
      <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={{ title: 'Create Invoice' }} />
    </Stack.Navigator>
  );
}
