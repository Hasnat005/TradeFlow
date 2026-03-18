import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionItem } from '../components/dashboard/ActionItem';
import { ActivityItem } from '../components/dashboard/ActivityItem';
import { AlertCard } from '../components/dashboard/AlertCard';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricCard } from '../components/dashboard/MetricCard';
import { SectionHeader } from '../components/dashboard/SectionHeader';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppStore } from '../store/useAppStore';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const userName = useAppStore((state) => state.userName);
  const companyName = useAppStore((state) => state.companyName ?? 'Hasnat Traders Ltd.');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const metrics = [
    {
      title: 'Outstanding Invoices',
      amount: '$124,850',
      insight: '18 invoices',
      additional: 'Due this month',
      trend: 'down' as const,
    },
    {
      title: 'Active Financing',
      amount: '$78,420',
      insight: '6 facilities',
      additional: 'Next payment Apr 12',
      trend: 'up' as const,
    },
  ] as const;

  const primaryActions = [
    { label: 'Create Invoice', icon: 'document-text-outline' as const, color: theme.colors.primary },
    { label: 'Request Financing', icon: 'cash-outline' as const, color: theme.colors.success },
    { label: 'Track Payments', icon: 'card-outline' as const, color: theme.colors.warning },
    { label: 'View Reports', icon: 'stats-chart-outline' as const, color: theme.colors.info },
  ] as const;

  const secondaryActions = [
    { label: 'Issue Guarantee', icon: 'shield-checkmark-outline' as const, color: theme.colors.info },
    { label: 'Add Purchase Order', icon: 'receipt-outline' as const, color: theme.colors.primary },
    { label: 'View Transactions', icon: 'swap-horizontal-outline' as const, color: theme.colors.primary },
    { label: 'Ledger / Accounts', icon: 'book-outline' as const, color: theme.colors.success },
  ] as const;

  const recentActivity = [
    {
      title: 'Invoice Created',
      description: 'INV-2048 submitted for buyer approval',
      timestamp: '2h ago',
      status: 'approved' as const,
    },
    {
      title: 'Financing Approved',
      description: 'FR-923 approved for $12,000 disbursement',
      timestamp: '5h ago',
      status: 'pending' as const,
    },
    {
      title: 'Payment Settled',
      description: 'TX-554 settled against invoice INV-2031',
      timestamp: 'Yesterday',
      status: 'completed' as const,
    },
    {
      title: 'Guarantee Issued',
      description: 'BG-112 issued for PO-902',
      timestamp: 'Yesterday',
      status: 'approved' as const,
    },
  ];

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const fabBottomOffset = tabBarHeight - 100;
  const listBottomPadding = tabBarHeight - 100;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top > 0 ? 8 : 16 }]}
    >
      <FlatList
        style={[styles.list, { backgroundColor: theme.colors.background }]}
        data={recentActivity}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <View style={[styles.activityItemWrap, { marginHorizontal: 16 }]}> 
            <ActivityItem
              title={item.title}
              description={item.description}
              timestamp={item.timestamp}
              status={item.status}
            />
          </View>
        )}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: listBottomPadding }]}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.sectionBlock}>
              <DashboardHeader companyName={companyName} greeting={getGreeting()} userName={userName} />
              <BalanceCard amount="$26,930" updatedAt="5 minutes ago" />
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader title="Primary Metrics" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.metricScrollContent}
              >
                {metrics.map((metric) => (
                  <MetricCard
                    key={metric.title}
                    title={metric.title}
                    amount={metric.amount}
                    insight={metric.insight}
                    additional={metric.additional}
                    trend={metric.trend}
                  />
                ))}
              </ScrollView>
            </View>

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  ...theme.shadow,
                },
                styles.sectionBlock,
              ]}
            >
              <SectionHeader title="Quick Actions" />

              <View style={styles.actionGrid}>
                {primaryActions.map((action) => (
                  <ActionItem key={action.label} icon={action.icon} label={action.label} color={action.color} />
                ))}
              </View>

              {showMoreActions ? (
                <View style={styles.actionGrid}>
                  {secondaryActions.map((action) => (
                    <ActionItem
                      key={action.label}
                      icon={action.icon}
                      label={action.label}
                      color={action.color}
                      compact
                    />
                  ))}
                </View>
              ) : null}

              <Pressable
                onPress={() => setShowMoreActions((value) => !value)}
                style={({ pressed }) => [
                  styles.moreActionsButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: pressed ? `${theme.colors.primary}12` : theme.colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="More actions"
              >
                <Ionicons
                  name={showMoreActions ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={[styles.moreActionsText, { color: theme.colors.primary }]}>More Actions</Text>
              </Pressable>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader title="Insights & Alerts" />
              <AlertCard
                title="Payments Due Today"
                description="3 invoices require payment today"
                actionLabel="View Invoices"
                tone="warning"
              />
            </View>

            <View
              style={[
                styles.upgradeTaskCard,
                {
                  backgroundColor: theme.colors.surface,
                },
                styles.sectionBlock, 
              ]}
            >
              <Text style={[styles.upgradeTitle, { color: theme.colors.text }]}>Increase Your Credit Limit</Text>

              <Text style={[styles.upgradeSubtitle, { color: theme.colors.muted }]}> 
                Complete your profile to unlock a higher financing cap. You are only 2 steps away from a
                potential $25,000 limit.
              </Text>

              <View style={[styles.progressTrack, { backgroundColor: `${theme.colors.primary}1F` }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.progressGlow, { backgroundColor: `${theme.colors.primary}33` }]} />
              </View>

              <Text style={[styles.progressLabel, { color: theme.colors.primary }]}>70% complete</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.finishSetupButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Finish setup"
              >
                <Text style={[styles.finishSetupButtonText, { color: theme.colors.onPrimary }]}>Finish Setup</Text>
              </Pressable>

              <Pressable
                style={styles.learnMoreButton}
                accessibilityRole="button"
                accessibilityLabel="Learn more"
              >
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.learnMoreText, { color: theme.colors.primary }]}>Learn More</Text>
              </Pressable>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader title="Recent Activity" subtitle="Latest financial operations" />
            </View>
          </>
        }
        ListFooterComponent={<View style={styles.listFooterSpace} />}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            bottom: fabBottomOffset,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create invoice"
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
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  sectionBlock: {
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  sectionCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  metricScrollContent: {
    gap: 16,
    paddingRight: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreActionsButton: {
    alignSelf: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreActionsText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  upgradeTaskCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  upgradeTitle: {
    fontFamily: Platform.select({ android: 'Roboto', ios: 'System', default: 'System' }),
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  upgradeSubtitle: {
    fontFamily: Platform.select({ android: 'Roboto', ios: 'System', default: 'System' }),
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    width: '70%',
    height: 2,
    borderRadius: 999,
  },
  progressGlow: {
    position: 'absolute',
    left: 0,
    width: '70%',
    height: 6,
    borderRadius: 999,
  },
  progressLabel: {
    fontFamily: Platform.select({ android: 'Roboto', ios: 'System', default: 'System' }),
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  finishSetupButton: {
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  finishSetupButtonText: {
    fontFamily: Platform.select({ android: 'Roboto', ios: 'System', default: 'System' }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  learnMoreButton: {
    minHeight: 28,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    marginLeft: 6,
    fontFamily: Platform.select({ android: 'Roboto', ios: 'System', default: 'System' }),
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  activityItemWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  listFooterSpace: {
    height: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    minHeight: 48,
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
