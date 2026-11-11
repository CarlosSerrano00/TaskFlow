import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';

export default function NotFoundScreen() {
  return (
    <Screen contentClassName="items-center justify-center pb-16">
      <Logo />
      <View className="mt-8 h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft">
        <Ionicons name="compass-outline" size={30} color="#5B5BD6" />
      </View>
      <Text className="mt-4 text-center text-3xl font-extrabold tracking-tight text-foreground">
        Pantalla no encontrada
      </Text>
      <Text className="mt-2 max-w-[300px] text-center text-base leading-6 text-foreground-muted">
        La ruta que buscas no existe o cambió de lugar.
      </Text>
      <View className="mt-6 w-full">
        <Button title="Volver al inicio" onPress={() => router.replace('/(tabs)')} />
      </View>
    </Screen>
  );
}
