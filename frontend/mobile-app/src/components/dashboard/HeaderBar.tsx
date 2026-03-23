import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCurrency } from '../../features/invoices/utils';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  companyName: string;
  subtitle: string;
  availableBalance: number;
  isBalanceVisible: boolean;
  onToggleBalance: () => void;
  onPressProfile?: () => void;
  onPressNotifications?: () => void;
};

export function HeaderBar({
  companyName,
  subtitle,
  availableBalance,
  isBalanceVisible,
  onToggleBalance,
  onPressProfile,
  onPressNotifications,
}: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.shadowWrap}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.info]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            paddingTop: Math.max(12, insets.top * 0.35),
          },
        ]}
      >
        <View style={styles.rowBetween}>
          <View style={styles.titleWrap}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.actionsWrap}>
            <Pressable
              onPress={onPressNotifications}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.85 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={onPressProfile}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.85 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              <Ionicons name="person-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={onToggleBalance}
          style={({ pressed }) => [styles.balancePill, { opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Toggle balance visibility"
        >
          <Ionicons name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'} size={14} color="#FFFFFF" />
          <Text style={styles.balanceLabel}>View Balance</Text>
          <Text style={styles.balanceValue}>{isBalanceVisible ? formatCurrency(availableBalance) : '••••••'}</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balancePill: {
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.96)',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
