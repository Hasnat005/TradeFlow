import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  progressPercent: number;
  label?: string;
};

export function ProgressBar({ progressPercent, label }: Props) {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(100, progressPercent));

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.colors.muted }]}>{label}</Text> : null}
      <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: theme.colors.primary }]} />
      </View>
      <Text style={[styles.percent, { color: theme.colors.text }]}>{clamped}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  percent: {
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
});
