import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { useBooking, useUpdateBookingStatus } from '@toolshare/supabase';
import { BOOKING_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@toolshare/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import {
  AppText,
  Avatar,
  Button,
  Card,
  EmptyState,
  Icon,
  Spinner,
  StatusBadge,
} from '@/components/ui';
import { colors } from '@/theme';

// Booking detail. The confirmation step of the booking wizard pushes here, so
// this route must exist or an in-person booking dead-ends on "no route".
export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: booking, isLoading } = useBooking(supabase, id);
  const updateStatus = useUpdateBookingStatus(supabase);

  if (isLoading) return <Spinner cover className="bg-background" />;

  if (!booking) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          icon="alert-circle-outline"
          title="Booking not found"
          message="It may have been cancelled or removed."
          actionLabel="Back to requests"
          onAction={() => router.replace('/(tabs)/bookings')}
        />
      </View>
    );
  }

  const isOwner = user?.id === booking.owner_id;
  const counterparty = isOwner ? booking.renter : booking.owner;
  const canCancel = booking.booking_status === 'pending' || booking.booking_status === 'confirmed';
  const canReview = booking.booking_status === 'completed';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View className="mb-5 flex-row items-center justify-between">
        <AppText variant="h2">{isOwner ? 'Rental request' : 'Your booking'}</AppText>
        <StatusBadge status={booking.booking_status} />
      </View>

      {/* Tool summary */}
      <Card className="mb-4 flex-row gap-3 p-3">
        <Image
          source={booking.tool?.photo_urls?.[0] ?? null}
          style={{ width: 72, height: 72, borderRadius: 8 }}
          contentFit="cover"
        />
        <View className="flex-1 justify-center">
          <AppText className="font-body-semibold text-base text-stone-900" numberOfLines={2}>
            {booking.tool?.title ?? 'Tool'}
          </AppText>
          {booking.tool?.address_display ? (
            <AppText variant="caption" className="mt-1">
              {booking.tool.address_display}
            </AppText>
          ) : null}
        </View>
      </Card>

      {/* Dates */}
      <Card className="mb-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Icon name="calendar-outline" size={18} color={colors.stone[600]} />
          <AppText variant="body-sm">
            {booking.start_date} → {booking.end_date}
          </AppText>
        </View>
        <View className="flex-row items-center gap-3">
          <Icon name="cube-outline" size={18} color={colors.stone[600]} />
          <AppText variant="body-sm">{booking.pickup_type}</AppText>
        </View>
      </Card>

      {/* Payment */}
      <Card className="mb-4 gap-2">
        <AppText className="mb-1 font-body-semibold text-base text-stone-900">Payment</AppText>
        <View className="flex-row justify-between">
          <AppText variant="body-sm">Rental</AppText>
          <AppText variant="body-sm" className="text-stone-900">
            ${booking.total_price.toFixed(2)}
          </AppText>
        </View>
        <View className="flex-row justify-between">
          <AppText variant="body-sm">Deposit (refundable)</AppText>
          <AppText variant="body-sm" className="text-stone-900">
            ${booking.deposit_amount.toFixed(2)}
          </AppText>
        </View>
        <View className="mt-1 flex-row justify-between border-t border-border pt-3">
          <AppText className="font-body-semibold text-base text-stone-900">Total</AppText>
          <AppText className="font-body-semibold text-base text-stone-900">
            ${(booking.total_price + booking.deposit_amount).toFixed(2)}
          </AppText>
        </View>
        <AppText variant="caption" className="mt-1">
          {PAYMENT_METHOD_LABELS[booking.payment_method]} · {booking.payment_status}
        </AppText>
      </Card>

      {/* Counterparty */}
      {counterparty ? (
        <Card className="mb-4 flex-row items-center gap-3">
          <Avatar name={counterparty.display_name} uri={counterparty.avatar_url} size="md" />
          <View className="flex-1">
            <AppText className="font-body-medium text-base text-stone-900">
              {counterparty.display_name}
            </AppText>
            <AppText variant="caption">{isOwner ? 'Renter' : 'Owner'}</AppText>
          </View>
        </Card>
      ) : null}

      <View className="gap-3">
        <Button
          label="Message"
          variant="secondary"
          icon="chatbubble-outline"
          className="border-border bg-surface"
          onPress={() => router.push(`/bookings/${booking.id}/chat`)}
        />

        {isOwner && booking.booking_status === 'pending' ? (
          <View className="flex-row gap-3">
            <Button
              label="Decline"
              variant="destructive"
              className="flex-1"
              loading={updateStatus.isPending}
              onPress={() =>
                updateStatus.mutate({ id: booking.id, status: 'cancelled' })
              }
            />
            <Button
              label="Approve"
              className="flex-1"
              loading={updateStatus.isPending}
              onPress={() =>
                updateStatus.mutate({ id: booking.id, status: 'confirmed' })
              }
            />
          </View>
        ) : null}

        {canReview ? (
          <Button
            label="Leave a review"
            onPress={() => router.push(`/review/${booking.id}`)}
          />
        ) : null}

        {!isOwner && canCancel ? (
          <Button
            label="Cancel booking"
            variant="ghost"
            loading={updateStatus.isPending}
            onPress={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
          />
        ) : null}
      </View>

      <AppText variant="caption" className="mt-6 text-center">
        {BOOKING_STATUS_LABELS[booking.booking_status]} · Booked{' '}
        {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : '—'}
      </AppText>
    </ScrollView>
  );
}
