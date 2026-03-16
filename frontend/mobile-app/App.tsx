import { AppProviders } from './src/components/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
