import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const markSize = size === 'lg' ? 'h-16 w-16 rounded-[22px]' : size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-12 w-12 rounded-2xl';
  const iconSize = size === 'lg' ? 34 : size === 'sm' ? 20 : 26;
  const textSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-2xl';

  return (
    <View className="flex-row items-center gap-3">
      <View className={`items-center justify-center bg-primary shadow-sm ${markSize}`}>
        <Ionicons name="checkmark-done" size={iconSize} color="#FFFFFF" />
        <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-surface bg-accent" />
      </View>
      <Text className={`font-extrabold tracking-tight text-foreground ${textSize}`}>
        Task<Text className="text-primary">Flow</Text>
      </Text>
    </View>
  );
}
