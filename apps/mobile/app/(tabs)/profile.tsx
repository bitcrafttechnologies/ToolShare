import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '@toolshare/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { data: profile } = useProfile(supabase, user?.id ?? '');

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <View className="mb-6 items-center">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-gray-200">
          <Text className="text-2xl font-bold text-gray-500">
            {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-xl font-semibold">{profile?.display_name ?? 'Loading...'}</Text>
        <Text className="text-gray-500">{user?.email}</Text>
        {profile?.is_identity_verified && (
          <Text className="mt-1 text-sm text-green-600">✓ Identity verified</Text>
        )}
      </View>

      <TouchableOpacity
        className="mb-3 rounded-xl bg-primary-500 py-4"
        onPress={() => router.push('/my-listings')}
      >
        <Text className="text-center font-semibold text-white">My listings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-3 rounded-xl border border-gray-300 py-4"
        onPress={() => router.push('/tools/new')}
      >
        <Text className="text-center font-semibold text-gray-700">List a tool</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="rounded-xl border border-red-200 py-4"
        onPress={handleSignOut}
      >
        <Text className="text-center font-semibold text-red-600">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
