import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  timestamp?: string;
  done: boolean;
  last?: boolean;
};

export function TimelineStep({ label, timestamp, done, last }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.railWrap}>
        <View style={[styles.dot, { backgroundColor: done ? theme.colors.primary : theme.colors.border }]} />
        {!last ? <View style={[styles.rail, { backgroundColor: theme.colors.border }]} /> : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.timestamp, { color: theme.colors.muted }]}>{timestamp ?? '--'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  railWrap: {
    width: 10,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  rail: {
    width: 2,
    height: 24,
    marginTop: 4,
    borderRadius: 999,
  },
  textWrap: {
    flex: 1,
    paddingBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
