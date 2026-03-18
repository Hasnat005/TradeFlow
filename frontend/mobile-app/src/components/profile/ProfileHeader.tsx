import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ProfileHeaderProps = {
  companyName: string;
  industry?: string;
  verified?: boolean;
};

export function ProfileHeader({ companyName, industry, verified }: ProfileHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}14` }]}>
        <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.textWrap}>
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
  textWrap: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
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
