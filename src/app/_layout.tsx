import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { SplashScreenView } from '@/components/splash-screen';
import { usePalette } from '@/constants/palette';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { useAuthDeepLinks } from '@/hooks/use-auth-deep-links';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <TasksProvider>
        <RootNavigator />
      </TasksProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, initializing } = useAuth();
  const scheme = useColorScheme();
  const palette = usePalette();

  useAuthDeepLinks();

  useEffect(() => {
    if (!initializing) {
      void SplashScreen.hideAsync();
    }
  }, [initializing]);

  if (initializing) {
    return <SplashScreenView />;
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="tasks/create"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="tasks/edit"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* Always available: deep links must be able to complete the flow. */}
        <Stack.Screen name="auth/callback" options={{ animation: 'fade' }} />
        <Stack.Screen name="reset-password" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}
