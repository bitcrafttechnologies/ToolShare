import { useState } from 'react';
import { Dimensions, FlatList, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import {
  useFavoriteToolIds,
  useReviewsForTool,
  useTool,
  useToggleFavorite,
} from '@toolshare/supabase';
import { TOOL_CONDITION_LABELS } from '@toolshare/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  IconButton,
  Rating,
  Spinner,
} from '@/components/ui';
import { colors } from '@/theme';

const { width } = Dimensions.get('window');
const GALLERY_WIDTH = width - 40; // 20px page padding each side (Figma gallery)

// Figma tool-detail-mobile (2031:90): nav row, paged gallery with dots,
// identity block, detail sections, stone owner card, sticky CTA bar.
export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: tool, isLoading } = useTool(supabase, id);
  const { data: reviews = [] } = useReviewsForTool(supabase, id);
  const { data: favoriteIds } = useFavoriteToolIds(supabase, user?.id);
  const toggleFavorite = useToggleFavorite(supabase, user?.id);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <Spinner cover />
      </SafeAreaView>
    );
  }

  if (!tool) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <EmptyState
          icon="alert-circle-outline"
          title="Tool not found"
          message="This listing may have been removed."
          actionLabel="Back to browse"
          onAction={() => router.push('/search')}
        />
      </SafeAreaView>
    );
  }

  const favorited = favoriteIds?.has(tool.id) ?? false;
  const price = tool.daily_rate ?? tool.hourly_rate;
  const priceUnit = tool.daily_rate ? '/ day' : tool.hourly_rate ? '/ hr' : null;
  const photos = tool.photo_urls.length > 0 ? tool.photo_urls : [null];

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="h-14 flex-row items-center gap-4 border-b border-border px-5">
          <IconButton
            name="arrow-back"
            size={24}
            className="-ml-2 h-10 w-10"
            onPress={() => (router.canGoBack() ? router.back() : router.push('/search'))}
            accessibilityLabel="Go back"
          />
          <AppText className="flex-1 font-body-semibold text-base text-stone-900" numberOfLines={1}>
            {tool.title}
          </AppText>
          <IconButton
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? colors.primary[500] : colors.stone[700]}
            onPress={() => toggleFavorite.mutate({ toolId: tool.id, favorited })}
            accessibilityLabel={favorited ? 'Remove from favorites' : 'Save to favorites'}
          />
        </View>
      </SafeAreaView>

      {/* Bottom padding clears the sticky CTA bar so the last section is reachable. */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* Gallery */}
        <View className="gap-3 p-5">
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={photos}
            keyExtractor={(uri, index) => uri ?? `placeholder-${index}`}
            onMomentumScrollEnd={(e) =>
              setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / GALLERY_WIDTH))
            }
            renderItem={({ item }) =>
              item ? (
                <Image
                  source={{ uri: item }}
                  style={{ width: GALLERY_WIDTH, height: 300, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View
                  style={{ width: GALLERY_WIDTH, height: 300 }}
                  className="items-center justify-center rounded-md bg-surface-muted"
                >
                  <Icon name="image-outline" size={32} color={colors.stone[400]} />
                  <AppText variant="caption" className="mt-2">
                    No photo
                  </AppText>
                </View>
              )
            }
          />
          {photos.length > 1 ? (
            <View className="flex-row items-center justify-center gap-1.5">
              {photos.map((uri, index) => (
                <View
                  key={uri ?? index}
                  className={
                    index === photoIndex
                      ? 'h-2 w-2 rounded-full bg-primary-500'
                      : 'h-1.5 w-1.5 rounded-full bg-border-strong'
                  }
                />
              ))}
            </View>
          ) : null}
        </View>

        <View className="gap-8 px-6 pb-8">
          {/* Identity */}
          <View className="gap-3">
            {tool.category?.name ? (
              <Badge label={tool.category.name.toUpperCase()} tone="category" />
            ) : null}
            <AppText className="font-heading text-2xl text-stone-900">{tool.title}</AppText>
            <View className="flex-row flex-wrap items-center gap-2">
              {tool.rating > 0 ? <Rating value={tool.rating} count={tool.review_count} /> : null}
              <AppText className="font-body text-sm text-stone-600">
                {tool.rating > 0 ? '· ' : ''}
                {tool.address_display ?? 'Phoenix Metro Area'} ·{' '}
                {TOOL_CONDITION_LABELS[tool.condition]}
              </AppText>
            </View>
            {price != null ? (
              <View className="flex-row items-baseline gap-1 pt-2">
                <AppText className="font-heading text-h1 text-primary-500">${price}</AppText>
                <AppText className="font-body text-base text-stone-600">{priceUnit}</AppText>
              </View>
            ) : null}
            {tool.weekly_rate ? (
              <AppText variant="body-sm">${tool.weekly_rate} per week</AppText>
            ) : null}
          </View>

          {/* Primary actions */}
          <View className="gap-3">
            <Button
              label={tool.is_available ? 'Request to Borrow' : 'Unavailable'}
              disabled={!tool.is_available}
              onPress={() => router.push(`/booking/${tool.id}`)}
            />
            <Button
              label="Message Owner"
              variant="secondary"
              className="border-border bg-surface"
              onPress={() => router.push(`/profile/${tool.owner_id}`)}
            />
          </View>

          {tool.requires_license ? (
            <Card className="flex-row items-start gap-3 border-warning-100 bg-warning-50">
              <Icon name="warning-outline" size={20} color={colors.warning[600]} />
              <View className="flex-1">
                <AppText className="font-body-semibold text-sm text-warning-600">
                  License required
                </AppText>
                <AppText variant="body-sm" className="mt-1">
                  {tool.license_type ?? 'A valid license is required to rent this tool.'}
                </AppText>
              </View>
            </Card>
          ) : null}

          {tool.min_age > 0 ? (
            <View className="flex-row items-center gap-2">
              <Icon name="person-outline" size={16} color={colors.stone[600]} />
              <AppText variant="body-sm">Minimum age {tool.min_age}</AppText>
            </View>
          ) : null}

          {/* About */}
          {tool.description ? (
            <View className="gap-3">
              <AppText className="font-heading-semibold text-lg text-stone-900">
                About this tool
              </AppText>
              <AppText
                variant="body-sm"
                className="leading-6 text-stone-600"
                numberOfLines={descriptionExpanded ? undefined : 4}
              >
                {tool.description}
              </AppText>
              {tool.description.length > 180 ? (
                <AppText
                  className="font-body-semibold text-sm text-primary-500"
                  onPress={() => setDescriptionExpanded((v) => !v)}
                >
                  {descriptionExpanded ? 'Show less' : 'Show more'}
                </AppText>
              ) : null}
            </View>
          ) : null}

          {/* What's included — from tool.specifications */}
          {Object.keys(tool.specifications ?? {}).length > 0 ? (
            <View className="gap-3">
              <AppText className="font-heading-semibold text-lg text-stone-900">
                What&apos;s included
              </AppText>
              <View className="gap-3">
                {Object.entries(tool.specifications).map(([key, value]) => (
                  <View key={key} className="flex-row items-center gap-3">
                    <Icon name="checkmark-circle" size={20} color={colors.success[500]} />
                    <AppText variant="body-sm" className="flex-1">
                      {value ? `${key}: ${value}` : key}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Pickup / delivery */}
          <View className="gap-3">
            <AppText className="font-heading-semibold text-lg text-stone-900">
              Pickup &amp; delivery
            </AppText>
            {tool.pickup_available ? (
              <View className="flex-row items-center gap-3">
                <Icon name="location-outline" size={20} color={colors.stone[600]} />
                <AppText variant="body-sm">Pickup available</AppText>
              </View>
            ) : null}
            {tool.delivery_available ? (
              <View className="flex-row items-center gap-3">
                <Icon name="car-outline" size={20} color={colors.stone[600]} />
                <AppText variant="body-sm">
                  Delivery within {tool.delivery_radius_miles} miles
                </AppText>
              </View>
            ) : null}
            {tool.deposit_amount > 0 ? (
              <View className="flex-row items-center gap-3">
                <Icon name="shield-checkmark-outline" size={20} color={colors.stone[600]} />
                <AppText variant="body-sm">
                  ${tool.deposit_amount} refundable deposit
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Safety notes */}
          {tool.safety_notes ? (
            <View className="gap-3">
              <AppText className="font-heading-semibold text-lg text-stone-900">
                Safety notes
              </AppText>
              <AppText variant="body-sm" className="leading-6">
                {tool.safety_notes}
              </AppText>
            </View>
          ) : null}

          {/* Owner */}
          {tool.owner ? (
            <View className="gap-6 rounded-lg bg-surface-muted p-6">
              <View className="flex-row items-center gap-4">
                <Avatar
                  name={tool.owner.display_name}
                  uri={tool.owner.avatar_url}
                  size="xl"
                  className="bg-[#4A6741]"
                />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <AppText className="font-heading-semibold text-lg text-stone-900">
                      {tool.owner.display_name}
                    </AppText>
                    {tool.owner.is_identity_verified ? (
                      <Badge label="✓ Verified" tone="gold" className="border border-gold-500" />
                    ) : null}
                  </View>
                  {tool.owner.owner_rating > 0 ? (
                    <Rating
                      value={tool.owner.owner_rating}
                      count={tool.owner.review_count_owner}
                      size={13}
                    />
                  ) : (
                    <AppText variant="caption">New to Toolshare</AppText>
                  )}
                </View>
              </View>
              <Button
                label="View profile"
                variant="secondary"
                size="sm"
                className="self-start"
                onPress={() => router.push(`/profile/${tool.owner_id}`)}
              />
            </View>
          ) : null}

          {/* Reviews preview */}
          {reviews.length > 0 ? (
            <View className="gap-3">
              <AppText className="font-heading-semibold text-lg text-stone-900">
                Reviews ({tool.review_count})
              </AppText>
              {reviews.slice(0, 2).map((review) => (
                <Card key={review.id} className="gap-2">
                  <View className="flex-row items-center gap-3">
                    <Avatar
                      name={review.reviewer?.display_name}
                      uri={review.reviewer?.avatar_url}
                      size="sm"
                    />
                    <AppText className="flex-1 font-body-medium text-sm text-stone-900">
                      {review.reviewer?.display_name ?? 'Renter'}
                    </AppText>
                    <Rating value={review.rating} size={13} />
                  </View>
                  {review.comment ? (
                    <AppText variant="body-sm" className="leading-6">
                      {review.comment}
                    </AppText>
                  ) : null}
                </Card>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        className="flex-row items-center gap-4 border-t border-border bg-surface px-6 pt-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-1">
          {price != null ? (
            <View className="flex-row items-baseline gap-1">
              <AppText className="font-heading text-h2 text-stone-900">${price}</AppText>
              <AppText className="font-body text-sm text-stone-600">{priceUnit}</AppText>
            </View>
          ) : (
            <AppText className="font-heading text-h2 text-stone-900">Contact for price</AppText>
          )}
          {tool.deposit_amount > 0 ? (
            <AppText variant="caption">+ ${tool.deposit_amount} deposit</AppText>
          ) : null}
        </View>
        <Button
          label={tool.is_available ? 'Book now' : 'Unavailable'}
          disabled={!tool.is_available}
          className="flex-1"
          onPress={() => router.push(`/booking/${tool.id}`)}
        />
      </View>
    </View>
  );
}
