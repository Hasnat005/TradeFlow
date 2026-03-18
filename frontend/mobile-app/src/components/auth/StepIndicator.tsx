import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.caption, { color: theme.colors.muted }]}>{`Step ${currentStep} of ${totalSteps}`}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.progress,
            {
              width: `${Math.max(0, Math.min(100, (currentStep / totalSteps) * 100))}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 8,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E4E8F0',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 999,
  },
});
