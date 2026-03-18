import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type ErrorMessageProps = {
  message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  const theme = useAppTheme();

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor: `${theme.colors.danger}50`, backgroundColor: `${theme.colors.danger}10` }]}>
      <Text style={[styles.text, { color: theme.colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
