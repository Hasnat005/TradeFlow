import { StyleSheet, Text, View } from 'react-native';

import { FinancingStatus } from '../../features/financing/types';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  status: FinancingStatus;
};

export function StatusBadge({ status }: Props) {
  const theme = useAppTheme();

  const colorByStatus: Record<FinancingStatus, string> = {
    Pending: theme.colors.warning,
    'Under Review': theme.colors.warning,
    Approved: theme.colors.success,
    Rejected: theme.colors.danger,
    Disbursed: theme.colors.info,
    Repaid: theme.colors.success,
  };

  const color = colorByStatus[status];

  const repaidTone = status === 'Repaid' ? '35' : '16';

  return (
    <View style={[styles.badge, { borderColor: `${color}40`, backgroundColor: `${color}${repaidTone}` }]}>
      <Text style={[styles.label, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
