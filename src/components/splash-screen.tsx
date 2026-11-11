import { Text, View } from 'react-native';

import { Animation } from '@/components/ui/animation';
import { Logo } from '@/components/ui/logo';

export function SplashScreenView() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-background px-8">
      <Animation name="welcome" size={250} speed={0.9} />
      <Logo size="lg" />
      <Text className="mt-2 text-center text-sm leading-5 text-foreground-muted">
        Organiza tu día, celebra tu progreso.
      </Text>
      <View className="mt-6 h-1 w-12 rounded-full bg-primary/20" />
    </View>
  );
}
