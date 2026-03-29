import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/common/AppCard';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppNotification, useNotificationStore } from '../store/useNotificationStore';

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

type NotificationItemProps = {
  item: AppNotification;
  expanded: boolean;
  onPress: (id: string) => void;
};

const NotificationItem = memo(function NotificationItem({ item, expanded, onPress }: NotificationItemProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [
        styles.itemPressable,
        {
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <AppCard style={[styles.itemCard, { borderColor: item.read ? theme.colors.border : `${theme.colors.primary}66` }]}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemTitleWrap}>
            <Text numberOfLines={1} style={[styles.itemTitle, { color: theme.colors.text, fontWeight: item.read ? '600' : '800' }]}>
              {item.title}
            </Text>
            <Text style={[styles.itemTime, { color: theme.colors.muted }]}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          {!item.read ? <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} /> : null}
        </View>

        <Text
          numberOfLines={expanded ? 8 : 2}
          style={[styles.itemMessage, { color: theme.colors.muted }]}
        >
          {item.message}
        </Text>
      </AppCard>
    </Pressable>
  );
});

export function NotificationHistoryScreen() {
  const theme = useAppTheme();
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications],
  );

  const onPressItem = useCallback(
    (id: string) => {
      markAsRead(id);
      setExpandedId((prev) => (prev === id ? null : id));
    },
    [markAsRead],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationItem item={item} expanded={expandedId === item.id} onPress={onPressItem} />
    ),
    [expandedId, onPressItem],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.headerWrap}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Notification History</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Stay up to date with account activity</Text>
        </View>

        <Pressable
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
          style={({ pressed }) => [
            styles.markAllButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: pressed ? `${theme.colors.primary}12` : theme.colors.surface,
              opacity: unreadCount === 0 ? 0.55 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
        >
          <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.markAllText, { color: theme.colors.primary }]}>Mark all as read</Text>
        </Pressable>
      </View>

      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={[styles.emptyWrap, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
            <Ionicons name="notifications-off-outline" size={24} color={theme.colors.muted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.muted }]}>You will see updates about invoices, financing, and payments here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  markAllButton: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  separator: {
    height: 10,
  },
  itemPressable: {
    borderRadius: 14,
  },
  itemCard: {
    gap: 8,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemTitleWrap: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 14,
  },
  itemTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 19,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  emptyWrap: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});