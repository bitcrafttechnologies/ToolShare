import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { createProfileRepository } from '@toolshare/supabase';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  // expo-notifications 0.31 replaced shouldShowAlert with the more granular
  // shouldShowBanner / shouldShowList pair.
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      if (!projectId) return;

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const repo = createProfileRepository(supabase);
      await repo.updatePushToken(userId, token);
    })();
  }, [userId]);
}
