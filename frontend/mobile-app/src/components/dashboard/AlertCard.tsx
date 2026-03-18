import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type AlertTone = 'urgent' | 'warning' | 'good';

type AlertCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  tone: AlertTone;
  onPress?: () => void;
};

export function AlertCard({ title, description, actionLabel, tone, onPress }: AlertCardProps) {
  const theme = useAppTheme();

  const toneColor =
    tone === 'urgent' ? theme.colors.danger : tone === 'warning' ? theme.colors.warning : theme.colors.success;

  const toneIcon = tone === 'urgent' ? 'alert-circle-outline' : tone === 'warning' ? 'warning-outline' : 'checkmark-circle-outline';

  return (
    <View style={[styles.card, { backgroundColor: `${toneColor}14`, borderColor: `${toneColor}40` }]}>
      <View style={styles.leftWrap}>
        <Ionicons name={toneIcon} size={18} color={toneColor} />
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: toneColor }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>{description}</Text>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.cta, { borderColor: `${toneColor}70`, opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
      >
        <Text style={[styles.ctaText, { color: toneColor }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  cta: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
