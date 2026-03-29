import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { SkeletonItem } from './SkeletonItem';

function SkeletonSection({ rows = 3 }: { rows?: number }) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <View style={styles.sectionHeader}>
        <SkeletonItem width={18} height={18} radius={5} />
        <SkeletonItem width={120} height={14} radius={6} />
      </View>

      <View style={styles.rowsWrap}>
        {Array.from({ length: rows }).map((_, index) => (
          <View key={`row-${index}`} style={styles.infoRow}>
            <SkeletonItem width="38%" height={12} radius={6} />
            <SkeletonItem width="45%" height={12} radius={6} />
          </View>
        ))}
      </View>

      <SkeletonItem width="100%" height={46} radius={12} />
    </View>
  );
}

export function ProfileSkeleton() {
  const theme = useAppTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <View style={styles.profileHeaderRow}>
            <SkeletonItem width={52} height={52} radius={14} />
            <View style={styles.profileTextWrap}>
              <SkeletonItem width="42%" height={16} radius={8} />
              <SkeletonItem width="58%" height={12} radius={6} />
              <SkeletonItem width="55%" height={12} radius={6} />
            </View>
          </View>

          <View style={styles.rowsWrap}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={`header-row-${index}`} style={styles.infoRow}>
                <SkeletonItem width="32%" height={12} radius={6} />
                <SkeletonItem width="52%" height={12} radius={6} />
              </View>
            ))}
          </View>
        </View>

        <SkeletonSection rows={4} />
        <SkeletonSection rows={3} />
        <SkeletonSection rows={4} />
      </ScrollView>
    </SafeAreaView>
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
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileTextWrap: {
    flex: 1,
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowsWrap: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});