import { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';

type SkeletonItemProps = {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonItem({ width, height, radius = 10, style }: SkeletonItemProps) {
  const theme = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <View style={style}>
      <Animated.View
        style={[
          styles.block,
          {
            width,
            height,
            borderRadius: radius,
            backgroundColor: theme.statusBarStyle === 'dark' ? '#E5E7EB' : '#2B3444',
            opacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
});