import { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key || loading) return;

    const currentPath = rootNavigationState.routes[rootNavigationState.index]?.name;
    
    if (!user) {
      // User is not authenticated, redirect to sign-in if not already on auth screen
      if (!currentPath?.includes('(auth)')) {
        router.replace('/(auth)/sign-in');
      }
    } else {
      // User is authenticated, redirect to main app if on auth screen
      if (currentPath?.includes('(auth)')) {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, rootNavigationState?.key, router]);

  // Show nothing while navigation is not ready or auth is loading
  if (!rootNavigationState?.key || loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="crop-selection" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <LanguageProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </LanguageProvider>
    </AuthProvider>
  );
}