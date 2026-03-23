import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  done: boolean;
  timestamp?: string;
  last?: boolean;
};

export function TimelineStep({ label, done, timestamp, last }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.railWrap}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: done ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
        {!last ? (
          <View
            style={[
              styles.rail,
              {
                backgroundColor: done ? `${theme.colors.primary}55` : theme.colors.border,
              },
            ]}
          />
        ) : null}
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
    alignItems: 'center',
    gap: 10,
  },
  railWrap: {
    width: 12,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  rail: {
    width: 2,
    height: 22,
    marginTop: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  textWrap: {
    gap: 2,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
});
