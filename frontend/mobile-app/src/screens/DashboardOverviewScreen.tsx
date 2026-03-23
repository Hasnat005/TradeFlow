import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionGridItem } from '../components/dashboard/ActionGridItem';
import { ActivityItem } from '../components/dashboard/ActivityItem';
import { AlertCard } from '../components/dashboard/AlertCard';
import { CreditCard } from '../components/dashboard/CreditCard';
import { HeaderBar } from '../components/dashboard/HeaderBar';
import { LoadingSkeleton } from '../components/dashboard/LoadingSkeleton';
import { MetricCard } from '../components/dashboard/MetricCard';
import { SectionHeader } from '../components/dashboard/SectionHeader';
import { useRecentTransactionsQuery, useDashboardSummaryQuery } from '../features/dashboard/hooks/useDashboard';
import { DashboardActivity } from '../features/dashboard/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { MainTabParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function DashboardOverviewScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();

  const companyName = useAppStore((state) => state.companyName ?? 'TradeFlow Business');

  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showMoreActions, setShowMoreActions] = useState(false);

  useEffect(() => {
    const isFabric = Boolean((global as { nativeFabricUIManager?: unknown }).nativeFabricUIManager);

    if (!isFabric && Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useDashboardSummaryQuery();

  const {
    data: activity,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useRecentTransactionsQuery(12);

  useFocusEffect(
    useCallback(() => {
      void refetchSummary();
      void refetchActivity();
    }, [refetchActivity, refetchSummary]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchActivity()]);
    setRefreshing(false);
  }, [refetchActivity, refetchSummary]);

  const metrics = useMemo(
    () => [
      {
        title: 'Available Balance',
        amount: summary?.available_balance ?? 0,
        insight: `${summary?.total_transactions ?? 0} transactions`,
        additional: 'Live ledger balance',
        highlighted: true,
      },
      {
        title: 'Outstanding Invoices',
        amount: summary?.outstanding_invoices_amount ?? 0,
        insight: `${summary?.pending_invoices_count ?? 0} invoices pending`,
        additional: 'Awaiting collection',
        trend: 'down' as const,
      },
      {
        title: 'Active Financing',
        amount: summary?.active_financing_amount ?? 0,
        insight: `${summary?.active_facilities_count ?? 0} active facilities`,
        additional: 'In approved/disbursed state',
        trend: 'up' as const,
      },
      {
        title: 'Pending Payments',
        amount: summary?.pending_payments_amount ?? 0,
        insight: `${summary?.pending_payments_count ?? 0} payments pending`,
        additional: `${summary?.payments_due_today_count ?? 0} due today`,
        trend: 'down' as const,
      },
    ],
    [summary],
  );

  const primaryActions = useMemo(
    () => [
      {
        key: 'create-invoice',
        label: 'Create Invoice',
        iconName: 'document-text-outline' as const,
        onPress: () => navigation.navigate('Invoices', { screen: 'CreateInvoice' }),
      },
      {
        key: 'request-financing',
        label: 'Request Financing',
        iconName: 'cash-outline' as const,
        onPress: () => navigation.navigate('Financing', { screen: 'FinancingRequest' }),
      },
      {
        key: 'add-order',
        label: 'Add Purchase Order',
        iconName: 'receipt-outline' as const,
        onPress: () => navigation.navigate('Orders', { screen: 'CreatePurchaseOrder' }),
      },
      {
        key: 'track-payments',
        label: 'Track Payments',
        iconName: 'card-outline' as const,
        onPress: () => navigation.navigate('Invoices', { screen: 'InvoiceList' }),
      },
      {
        key: 'view-transactions',
        label: 'View Transactions',
        iconName: 'swap-horizontal-outline' as const,
        onPress: () => navigation.navigate('Invoices', { screen: 'InvoiceList' }),
      },
      {
        key: 'ledger',
        label: 'Ledger',
        iconName: 'book-outline' as const,
        onPress: () => navigation.navigate('Invoices', { screen: 'InvoiceList' }),
      },
      {
        key: 'reports',
        label: 'Reports',
        iconName: 'document-lock-outline' as const,
        onPress: () => navigation.navigate('Profile'),
      },
      {
        key: 'analytics',
        label: 'Analytics',
        iconName: 'stats-chart-outline' as const,
        onPress: () => navigation.navigate('Profile'),
      },
    ],
    [navigation],
  );

  const extraActions = useMemo(
    () => [
      {
        key: 'invoices-dashboard',
        label: 'Invoices Home',
        iconName: 'folder-open-outline' as const,
        onPress: () => navigation.navigate('Invoices', { screen: 'InvoiceList' }),
      },
      {
        key: 'financing-dashboard',
        label: 'Financing Home',
        iconName: 'wallet-outline' as const,
        onPress: () => navigation.navigate('Financing', { screen: 'FinancingDashboard' }),
      },
      {
        key: 'orders-dashboard',
        label: 'Orders Home',
        iconName: 'clipboard-outline' as const,
        onPress: () => navigation.navigate('Orders', { screen: 'OrdersDashboard' }),
      },
      {
        key: 'profile',
        label: 'Profile',
        iconName: 'person-circle-outline' as const,
        onPress: () => navigation.navigate('Profile'),
      },
    ],
    [navigation],
  );

  const dashboardAlerts = summary?.alerts ?? [];
  const recentActivity = activity ?? [];

  const renderActivity = useCallback(
    ({ item }: { item: DashboardActivity }) => (
      <View style={styles.activityWrap}>
        <ActivityItem
          title={item.title}
          description={item.description}
          timestamp={formatTimestamp(item.timestamp)}
          status={item.status}
          amount={item.amount}
        />
      </View>
    ),
    [],
  );

  const isInitialLoading = (summaryLoading || activityLoading) && !summary;
  const hasError = summaryError || activityError;
  const listBottomPadding = tabBarHeight + 84;

  const onToggleSeeMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMoreActions((value) => !value);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top > 0 ? 8 : 16 }]}
    >
      <FlatList
        data={recentActivity}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <HeaderBar
              companyName={companyName}
              subtitle="Finance Overview"
              availableBalance={summary?.available_balance ?? 0}
              isBalanceVisible={showBalance}
              onToggleBalance={() => setShowBalance((value) => !value)}
              onPressNotifications={() => navigation.navigate('Profile')}
              onPressProfile={() => navigation.navigate('Profile')}
            />

            <View style={[styles.actionsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <SectionHeader title="Actions" subtitle="Tap to manage your business" />
              <View style={styles.actionsGrid}> 
                {primaryActions.map((action) => (
                  <ActionGridItem
                    key={action.key}
                    label={action.label}
                    iconName={action.iconName}
                    onPress={action.onPress}
                  />
                ))}
              </View>

              {showMoreActions ? (
                <View style={styles.actionsGrid}> 
                  {extraActions.map((action) => (
                    <ActionGridItem
                      key={action.key}
                      label={action.label}
                      iconName={action.iconName}
                      onPress={action.onPress}
                    />
                  ))}
                </View>
              ) : null}

              <Pressable
                onPress={onToggleSeeMore}
                style={({ pressed }) => [
                  styles.seeMoreButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: pressed ? `${theme.colors.primary}12` : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.seeMoreText, { color: theme.colors.primary }]}>
                  {showMoreActions ? 'See Less' : 'See More'}
                </Text>
              </Pressable>
            </View>

            <SectionHeader title="Primary Metrics" subtitle="Real-time financial overview" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricScrollContent}>
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  amount={metric.amount}
                  insight={metric.insight}
                  additional={metric.additional}
                  highlighted={metric.highlighted}
                  trend={metric.trend}
                />
              ))}
            </ScrollView>

            <SectionHeader title="Alerts & Insights" subtitle="Actionable risk indicators" />
            <View style={styles.alertsWrap}>
              {dashboardAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.title}
                  description={alert.description}
                  actionLabel={alert.tone === 'urgent' ? 'Review Now' : undefined}
                  tone={alert.tone}
                  onPress={() => navigation.navigate('Invoices', { screen: 'InvoiceList' })}
                />
              ))}
            </View>

            <CreditCard
              creditLimit={summary?.credit_limit ?? 0}
              usedCredit={summary?.used_credit ?? 0}
              availableCredit={summary?.available_credit ?? 0}
              usedPercent={summary?.used_credit_percent ?? 0}
            />

            <SectionHeader title="Recent Activity" subtitle="Transactions, invoice and financing updates" />

            {isInitialLoading ? <LoadingSkeleton /> : null}

            {hasError ? (
              <View style={[styles.errorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Unable to load dashboard</Text>
                <Text style={[styles.errorSubtitle, { color: theme.colors.muted }]}>Please retry fetching your latest financial data.</Text>
                <Pressable
                  onPress={() => {
                    void onRefresh();
                  }}
                  style={({ pressed }) => [
                    styles.retryButton,
                    { backgroundColor: theme.colors.primary, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            {!activityLoading && !hasError && recentActivity.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No recent activity yet</Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.muted }]}>New invoice, financing, and transaction events will appear here.</Text>
              </View>
            ) : null}
          </View>
        }
        contentContainerStyle={[styles.contentContainer, { paddingBottom: listBottomPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() => navigation.navigate('Invoices', { screen: 'CreateInvoice' })}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            bottom: tabBarHeight - 100,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
        <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>Create Invoice</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  headerContainer: {
    gap: 16,
  },
  actionsCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  metricScrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  seeMoreButton: {
    alignSelf: 'center',
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 0,
  },
  alertsWrap: {
    gap: 8,
  },
  activityWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
});
