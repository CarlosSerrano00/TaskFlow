import LottieView from 'lottie-react-native';
import type { AnimationObject } from 'lottie-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

type AnimationSource = 'welcome' | 'loading' | 'empty' | 'success';

const sources: Record<AnimationSource, AnimationObject> = {
  welcome: require('@/assets/animations/welcome.json') as AnimationObject,
  loading: require('@/assets/animations/loading.json') as AnimationObject,
  empty: require('@/assets/animations/empty.json') as AnimationObject,
  success: require('@/assets/animations/success.json') as AnimationObject,
};

export function Animation({
  name,
  size = 180,
  loop = true,
  autoPlay = true,
  speed = 1,
  style,
}: {
  name: AnimationSource;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LottieView
      source={sources[name]}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}

export function animationSources() {
  return sources;
}
