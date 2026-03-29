import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ProfileHeaderProps = {
  displayName: string;
  email?: string;
  companyName: string;
  industry?: string;
  verified?: boolean;
};

export function ProfileHeader({ displayName, email, companyName, industry, verified }: ProfileHeaderProps) {
  const theme = useAppTheme();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.wrap}>
      <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}16` }]}>
        <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{initials || 'U'}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{displayName}</Text>
        <Text style={[styles.email, { color: theme.colors.muted }]}>{email ?? 'No email linked'}</Text>

        <View style={styles.titleRow}>
          <Text style={[styles.companyName, { color: theme.colors.text }]}>{companyName}</Text>
          {verified ? (
            <View style={[styles.verifiedBadge, { backgroundColor: `${theme.colors.success}1A`, borderColor: `${theme.colors.success}40` }]}>
              <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
              <Text style={[styles.verifiedText, { color: theme.colors.success }]}>Verified</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.industry, { color: theme.colors.muted }]}>{industry ?? 'Business account'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  email: {
    fontSize: 12,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  industry: {
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
