import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { FinancingCard } from '../components/financing/FinancingCard';
import { CreditCard } from '../components/financing/CreditCard';
import { sampleFinancingAlerts } from '../features/financing/data';
import { useFinancingStore } from '../features/financing/store/useFinancingStore';
import { formatCurrency, getStatusSortWeight } from '../features/financing/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { FinancingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<FinancingStackParamList, 'FinancingDashboard'>;

export function FinancingScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const requests = useFinancingStore((state) => state.requests);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((left, right) => {
        const statusDelta = getStatusSortWeight(left.status) - getStatusSortWeight(right.status);
        if (statusDelta !== 0) {
          return statusDelta;
        }

        return right.requestedAt.localeCompare(left.requestedAt);
      }),
    [requests],
  );

  const summary = useMemo(() => {
    const totalRequested = requests.reduce((sum, request) => sum + request.requestedAmount, 0);
    const activeAmount = requests
      .filter((request) => request.status === 'Approved' || request.status === 'Disbursed')
      .reduce((sum, request) => sum + (request.approvedAmount ?? request.requestedAmount), 0);
    const repaidAmount = requests.reduce((sum, request) => sum + request.amountPaid, 0);
    const creditLimit = 120000;
    const usedLimit = activeAmount;

    return {
      totalRequested,
      activeAmount,
      availableLimit: Math.max(0, creditLimit - usedLimit),
      repaidAmount,
      creditLimit,
      usedLimit,
      activeFacilities: requests.filter((request) =>
        ['Approved', 'Disbursed'].includes(request.status),
      ).length,
    };
  }, [requests]);

  const onOpenRequest = (requestId: string) => {
    navigation.navigate('FinancingDetail', { requestId });
  };

  const listBottomPadding = tabBarHeight + 92;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <FlatList
        data={sortedRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FinancingCard item={item} onPress={() => onOpenRequest(item.id)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: listBottomPadding }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Trade Financing</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Request and monitor invoice-backed funding</Text>

            <View style={styles.summaryGrid}>
              <SummaryCard
                title="Total Requested"
                value={formatCurrency(summary.totalRequested)}
                insight={`${requests.length} requests`}
              />
              <SummaryCard
                title="Active Financing"
                value={formatCurrency(summary.activeAmount)}
                insight={`${summary.activeFacilities} active facilities`}
              />
              <SummaryCard
                title="Available Credit"
                value={formatCurrency(summary.availableLimit)}
                insight="Updated in real time"
              />
              <SummaryCard
                title="Repaid Amount"
                value={formatCurrency(summary.repaidAmount)}
                insight="Across all facilities"
              />
            </View>

            <CreditCard
              insights={{
                totalLimit: summary.creditLimit,
                usedLimit: summary.usedLimit,
                availableLimit: summary.availableLimit,
                repaidAmount: summary.repaidAmount,
              }}
            />

            <View style={styles.alertsWrap}>
              {sampleFinancingAlerts.map((alert) => {
                const colorByTone = {
                  info: theme.colors.info,
                  warning: theme.colors.warning,
                  danger: theme.colors.danger,
                  success: theme.colors.success,
                };

                const toneColor = colorByTone[alert.tone];

                return (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: `${toneColor}40`,
                      },
                    ]}
                  >
                    <Text style={[styles.alertTitle, { color: toneColor }]}>{alert.title}</Text>
                    <Text style={[styles.alertDescription, { color: theme.colors.muted }]}>{alert.description}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Financing Requests</Text>
          </View>
        }
      />

      <Pressable
        onPress={() => navigation.navigate('FinancingRequest')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: tabBarHeight -100,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>Request Financing</Text>
      </Pressable>
    </View>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  insight: string;
};

function SummaryCard({ title, value, insight }: SummaryCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          ...theme.shadow,
        },
      ]}
    >
      <Text style={[styles.summaryTitle, { color: theme.colors.muted }]}>{title}</Text>
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.summaryInsight, { color: theme.colors.primary }]}>{insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerWrap: {
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryCard: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  summaryInsight: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertsWrap: {
    gap: 8,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  separator: {
    height: 10,
  },
  fab: {
    position: 'absolute',
    right: 16,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B6BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  fabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
});
