import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/stores/auth';
import { queryClient, mmkvPersister } from '@/lib/queryClient';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, isLoading, initialize } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  // A font failure must not strand the app on a blank screen — degrade to
  // system fonts instead. `fontError` is surfaced so the cause is visible.
  const fontsSettled = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontError) {
      console.warn('[fonts] failed to load, falling back to system fonts:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (!isLoading && fontsSettled) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsSettled]);

  if (isLoading || !fontsSettled) return null;

  const stackScreenOptions = {
    headerShown: false,
    headerTitleStyle: { fontFamily: 'Outfit_500Medium' },
    headerTintColor: colors.stone[900],
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.stone[50] },
  } as const;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: mmkvPersister }}>
        <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
          {!session ? (
            <Stack screenOptions={stackScreenOptions}>
              <Stack.Screen name="(auth)" />
            </Stack>
          ) : (
            <Stack screenOptions={stackScreenOptions}>
              <Stack.Screen name="(tabs)" />
              {/* Draws its own nav row (back + heart); a native header would double it. */}
              <Stack.Screen name="tools/[id]" />
              <Stack.Screen name="booking/[toolId]" options={{ headerShown: true, title: 'Book tool' }} />
              <Stack.Screen name="bookings/[id]/index" options={{ headerShown: true, title: 'Booking' }} />
              <Stack.Screen name="bookings/[id]/chat" options={{ headerShown: true, title: 'Chat' }} />
              <Stack.Screen name="tools/new" options={{ headerShown: true, title: 'List a tool' }} />
              {/* Unregistered routes inherit headerShown:false — no back button and
                  no safe area, so content runs under the status bar. */}
              <Stack.Screen name="my-listings/index" options={{ headerShown: true, title: 'My listings' }} />
              <Stack.Screen name="profile/[userId]" options={{ headerShown: true, title: 'Profile' }} />
              <Stack.Screen name="review/[bookingId]" options={{ headerShown: true, title: 'Write review' }} />
            </Stack>
          )}
        </StripeProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
