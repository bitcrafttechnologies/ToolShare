import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Spinner } from '@/components/ui';
import { router } from 'expo-router';
import { useBookingsForRenter } from '@toolshare/supabase';
import { BOOKING_STATUS_LABELS } from '@toolshare/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useBookingsForRenter(supabase, user?.id ?? '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={<Text className="mb-4 text-xl font-semibold">My bookings</Text>}
      data={bookings}
      keyExtractor={(b) => b.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="mb-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          onPress={() => router.push(`/bookings/${item.id}`)}
        >
          <Text className="mb-1 font-semibold">{item.tool?.title ?? 'Tool'}</Text>
          <Text className="mb-1 text-sm text-gray-500">
            {item.start_date} → {item.end_date}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-primary-500">
              {BOOKING_STATUS_LABELS[item.booking_status]}
            </Text>
            <Text className="text-sm text-gray-500">${item.total_price.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text className="py-16 text-center text-gray-400">No bookings yet.</Text>
      }
    />
  );
}
