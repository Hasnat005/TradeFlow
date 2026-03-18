import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  label: string;
  done: boolean;
  last?: boolean;
};

export function TimelineStep({ label, done, last }: Props) {
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
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
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
});
