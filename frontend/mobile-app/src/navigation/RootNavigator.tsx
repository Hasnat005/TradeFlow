import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NotificationHistoryScreen } from '../screens/NotificationHistoryScreen';
import { useAppStore } from '../store/useAppStore';
import { AuthStackNavigator } from './AuthStackNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="NotificationHistory"
            component={NotificationHistoryScreen}
            options={{ headerShown: true, title: 'Notifications', presentation: 'card' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
}
