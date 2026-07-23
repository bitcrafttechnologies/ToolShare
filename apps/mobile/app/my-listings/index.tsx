import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Spinner } from '@/components/ui';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useToolsByOwner, useDeleteTool } from '@toolshare/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export default function MyListingsScreen() {
  const { user } = useAuthStore();
  const { data: tools = [], isLoading } = useToolsByOwner(supabase, user?.id ?? '');
  const deleteTool = useDeleteTool(supabase, user?.id ?? '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold">My listings</Text>
            <TouchableOpacity
              className="rounded-lg bg-primary-500 px-4 py-2"
              onPress={() => router.push('/tools/new')}
            >
              <Text className="font-semibold text-white">+ Add tool</Text>
            </TouchableOpacity>
          </View>
        }
        data={tools}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3 flex-row overflow-hidden rounded-xl border border-gray-200 bg-white"
            onPress={() => router.push(`/tools/${item.id}`)}
          >
            <Image
              source={item.photo_urls[0] ?? null}
              style={{ width: 80, height: 80 }}
              contentFit="cover"
            />
            <View className="flex-1 p-3">
              <Text className="font-semibold" numberOfLines={1}>{item.title}</Text>
              <Text className="text-sm text-gray-500">
                {item.daily_rate ? `$${item.daily_rate}/day` : 'No price set'} · {item.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="py-16 items-center">
            <Text className="mb-4 text-gray-400">No listings yet.</Text>
            <TouchableOpacity
              className="rounded-xl bg-primary-500 px-8 py-3"
              onPress={() => router.push('/tools/new')}
            >
              <Text className="font-semibold text-white">List your first tool</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
