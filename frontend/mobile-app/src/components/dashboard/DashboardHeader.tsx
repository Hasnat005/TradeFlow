import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type DashboardHeaderProps = {
  companyName: string;
  greeting: string;
  userName?: string;
};

export function DashboardHeader({ companyName, greeting, userName }: DashboardHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.companyWrap}>
          <Text style={[styles.companyName, { color: theme.colors.text }]}>{companyName}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Dashboard</Text>
        </View>

        <View style={styles.rightActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.avatar,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-outline" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <Text style={[styles.greeting, { color: theme.colors.muted }]}>
        {greeting}
        {userName ? `, ${userName}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyWrap: {
    flex: 1,
    paddingRight: 12,
  },
  companyName: {
    fontSize: 21,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
});
