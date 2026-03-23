import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { EmptyState } from '../components/financing/EmptyState';
import { LoadingSkeleton } from '../components/financing/LoadingSkeleton';
import { ProgressBar } from '../components/financing/ProgressBar';
import { StatusBadge } from '../components/financing/StatusBadge';
import { TimelineStep } from '../components/financing/TimelineStep';
import { useFinancingDetailQuery, useUpdateFinancingStatusMutation } from '../features/financing/hooks/useFinancing';
import { formatCurrency, getRepaymentProgress } from '../features/financing/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { FinancingStackParamList, MainTabParamList } from '../navigation/types';
import { NavigationProp } from '@react-navigation/native';

type Props = NativeStackScreenProps<FinancingStackParamList, 'FinancingDetail'>;

export function FinancingDetailScreen({ route }: Props) {
  const theme = useAppTheme();
  const mainTabNavigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { requestId } = route.params;
  const [actionError, setActionError] = useState<string | undefined>();

  const { data: request, isLoading, isError, refetch } = useFinancingDetailQuery(requestId);
  const updateStatusMutation = useUpdateFinancingStatusMutation(requestId);

  if (isLoading) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}> 
        <LoadingSkeleton />
      </View>
    );
  }

  if (isError || !request) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}> 
        <EmptyState
          title="Financing request unavailable"
          message="Please retry loading this request."
          actionLabel="Retry"
          onAction={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  const progressPercent = getRepaymentProgress(request);
  const remaining = Math.max(0, request.repayment.remaining);

  const onUpdateStatus = async (status: typeof request.status) => {
    setActionError(undefined);
    try {
      await updateStatusMutation.mutateAsync(status);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update financing status.');
    }
  };

  const timeline = request.timeline;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, ...theme.shadow }]}> 
        <View style={styles.rowBetween}>
          <Text style={[styles.requestId, { color: theme.colors.text }]}>{request.id}</Text>
          <StatusBadge status={request.status} />
        </View>

        <Text style={[styles.meta, { color: theme.colors.text }]}>Invoice Reference: {request.invoiceId}</Text>
        <Text style={[styles.meta, { color: theme.colors.text }]}>Buyer: {request.buyerName}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Disbursement: {request.disbursementDate ?? '--'}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>Repayment due: {request.repaymentDueDate ?? '--'}</Text>

        <View style={styles.metricRow}>
          <Metric label="Requested" value={formatCurrency(request.requestedAmount)} />
          <Metric label="Approved" value={request.approvedAmount ? formatCurrency(request.approvedAmount) : '--'} />
        </View>

        <View style={styles.metricRow}>
          <Metric label="Interest Rate" value={request.interestRate ? `${request.interestRate}%` : '--'} />
          <Metric label="Repayment" value={formatCurrency(request.repaymentAmount)} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Repayment Tracking</Text>
        <View style={styles.rowBetween}>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>Total</Text>
          <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formatCurrency(request.repayment.total)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>Paid</Text>
          <Text style={[styles.metaValue, { color: theme.colors.success }]}>{formatCurrency(request.repayment.paid)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>Remaining</Text>
          <Text style={[styles.metaValue, { color: theme.colors.warning }]}>{formatCurrency(remaining)}</Text>
        </View>

        <ProgressBar progressPercent={progressPercent} label="Repayment Progress" />
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timeline</Text>
        {timeline.map((step, index) => (
          <TimelineStep
            key={step.status}
            label={step.status}
            done={step.completed}
            timestamp={step.timestamp?.slice(0, 10)}
            last={index === timeline.length - 1}
          />
        ))}
      </View>

      <View style={styles.actionsWrap}>
        {request.status === 'Pending' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Under Review');
            }}
            style={({ pressed }) => [styles.primaryAction, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 }]}
          >
            <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Start Review</Text>
          </Pressable>
        ) : null}

        {request.status === 'Under Review' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Approved');
            }}
            style={({ pressed }) => [styles.primaryAction, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 }]}
          >
            <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Approve Request</Text>
          </Pressable>
        ) : null}

        {request.status === 'Approved' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Disbursed');
            }}
            style={({ pressed }) => [styles.primaryAction, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 }]}
          >
            <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Mark as Disbursed</Text>
          </Pressable>
        ) : null}

        {(request.status === 'Pending' || request.status === 'Under Review' || request.status === 'Approved') ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Rejected');
            }}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.danger,
                backgroundColor: pressed ? `${theme.colors.danger}12` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.danger }]}>Cancel Request</Text>
          </Pressable>
        ) : null}

        {request.status === 'Disbursed' ? (
          <Pressable
            onPress={() => {
              void onUpdateStatus('Repaid');
            }}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: theme.colors.success,
                backgroundColor: pressed ? `${theme.colors.success}12` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.success }]}>Mark as Repaid</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() =>
            mainTabNavigation.navigate('Invoices', {
              screen: 'InvoiceDetail',
              params: { invoiceId: request.invoiceId },
            })
          }
          style={({ pressed }) => [
            styles.secondaryAction,
            {
              borderColor: theme.colors.border,
              backgroundColor: pressed ? `${theme.colors.primary}12` : 'transparent',
            },
          ]}
        >
          <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>View Linked Invoice</Text>
        </Pressable>

        {actionError ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{actionError}</Text> : null}
      </View>
    </ScrollView>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.metricItem}>
      <Text style={[styles.metricLabel, { color: theme.colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  requestId: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(148,163,184,0.08)',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionsWrap: {
    gap: 10,
    marginTop: 2,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryAction: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
