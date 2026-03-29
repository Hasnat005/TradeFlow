import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCurrency } from '../../features/invoices/utils';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  displayName: string;
  subtitle?: string;
  availableBalance: number;
  isBalanceVisible: boolean;
  onToggleBalance: () => void;
  notificationCount?: number;
  onPressProfile?: () => void;
  onPressNotifications?: () => void;
};

export function HeaderBar({
  displayName,
  subtitle = "Here's your financial overview",
  availableBalance,
  isBalanceVisible,
  onToggleBalance,
  notificationCount = 0,
  onPressProfile,
  onPressNotifications,
}: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const hour = new Date().getHours();
  const greetingPrefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const normalizedName = displayName?.trim().split(/\s+/)[0]?.slice(0, 14);
  const greetingText = normalizedName ? `${greetingPrefix}, ${normalizedName}` : 'Welcome back';

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
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.companyName}>{greetingText}</Text>
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
              {notificationCount > 0 ? <View style={[styles.badge, { backgroundColor: theme.colors.warning }]} /> : null}
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
          style={({ pressed }) => [
            styles.balancePill,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Toggle balance visibility"
        >
          <View style={styles.balanceTopRow}>
            <Ionicons name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'} size={15} color="#FFFFFF" />
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 6,
    paddingRight: 12,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsWrap: {
    width: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  balancePill: {
    minHeight: 78,
    borderRadius: 16, // smoother, modern
    backgroundColor: 'rgba(255,255,255,0.12)', // reduced opacity → cleaner glass effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)', // slightly stronger for definition
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    alignSelf: 'flex-start',
    minWidth: 190,

    shadowColor: '#0f21ea', // neutral shadow (important)
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
});
