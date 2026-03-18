import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { ProgressBar } from '../components/financing/ProgressBar';
import { StatusBadge } from '../components/financing/StatusBadge';
import { TimelineStep } from '../components/financing/TimelineStep';
import { useFinancingStore } from '../features/financing/store/useFinancingStore';
import { formatCurrency, getRepaymentProgress } from '../features/financing/utils';
import { useAppTheme } from '../hooks/useAppTheme';
import { FinancingStackParamList, MainTabParamList } from '../navigation/types';
import { NavigationProp } from '@react-navigation/native';

type Props = NativeStackScreenProps<FinancingStackParamList, 'FinancingDetail'>;

export function FinancingDetailScreen({ route }: Props) {
  const theme = useAppTheme();
  const mainTabNavigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { requestId } = route.params;

  const request = useFinancingStore((state) => state.requests.find((item) => item.id === requestId));
  const acceptOffer = useFinancingStore((state) => state.acceptOffer);
  const cancelRequest = useFinancingStore((state) => state.cancelRequest);
  const markAsRepaid = useFinancingStore((state) => state.markAsRepaid);

  if (!request) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.fallbackText, { color: theme.colors.text }]}>Financing request not found</Text>
      </View>
    );
  }

  const progressPercent = getRepaymentProgress(request);
  const remaining = Math.max(0, request.repaymentAmount - request.amountPaid);

  const timeline = [
    { label: 'Requested', done: true },
    { label: 'Approved', done: ['Approved', 'Disbursed', 'Repaid'].includes(request.status) },
    { label: 'Disbursed', done: ['Disbursed', 'Repaid'].includes(request.status) },
    { label: 'Repaid', done: request.status === 'Repaid' },
  ];

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
          <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formatCurrency(request.repaymentAmount)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>Paid</Text>
          <Text style={[styles.metaValue, { color: theme.colors.success }]}>{formatCurrency(request.amountPaid)}</Text>
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
          <TimelineStep key={step.label} label={step.label} done={step.done} last={index === timeline.length - 1} />
        ))}
      </View>

      <View style={styles.actionsWrap}>
        {request.status === 'Approved' ? (
          <Pressable
            onPress={() => acceptOffer(request.id)}
            style={({ pressed }) => [styles.primaryAction, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.92 : 1 }]}
          >
            <Text style={[styles.primaryActionText, { color: theme.colors.onPrimary }]}>Accept Offer</Text>
          </Pressable>
        ) : null}

        {request.status === 'Pending' ? (
          <Pressable
            onPress={() => cancelRequest(request.id)}
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
            onPress={() => markAsRepaid(request.id)}
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
});
