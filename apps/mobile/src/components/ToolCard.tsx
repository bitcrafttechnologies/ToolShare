import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { Tool } from '@toolshare/types';
import { AppText, Icon, IconButton, Rating } from '@/components/ui';
import { colors } from '@/theme';

interface Props {
  tool: Tool;
  /**
   * `feed` — Figma dashboard-feed card (2015:233): white surface, 240px image,
   *   solid category pill, heart in the footer row.
   * `list` — Figma search-results card (2031:30): borderless on background,
   *   220px rounded image, translucent pill + heart overlaid, distance line.
   */
  variant?: 'feed' | 'list' | undefined;
  favorited?: boolean | undefined;
  onToggleFavorite?: (() => void) | undefined;
  /** Miles from the user, rendered in the `list` meta row when known. */
  distanceMiles?: number | undefined;
}

export function ToolCard({
  tool,
  variant = 'feed',
  favorited = false,
  onToggleFavorite,
  distanceMiles,
}: Props) {
  const price = tool.daily_rate ?? tool.hourly_rate;
  const priceUnit = tool.daily_rate ? '/ day' : tool.hourly_rate ? '/ hr' : null;
  const ownerLine = tool.owner?.display_name
    ? variant === 'feed'
      ? `Lent by ${tool.owner.display_name}`
      : tool.owner.display_name
    : (tool.address_display ?? 'Phoenix Metro Area');
  const goToTool = () => router.push(`/tools/${tool.id}`);

  if (variant === 'list') {
    return (
      <Pressable className="mb-8 gap-3" onPress={goToTool}>
        <View className="h-[220px] w-full overflow-hidden rounded-md">
          <Image
            source={tool.photo_urls[0] ?? null}
            style={{ width: '100%', height: 220 }}
            contentFit="cover"
            transition={200}
          />
          {tool.category?.name ? (
            <View className="absolute left-3 top-3 rounded-sm bg-primary-500/80 px-2 py-1">
              <AppText className="font-body-semibold text-micro uppercase text-white">
                {tool.category.name}
              </AppText>
            </View>
          ) : null}
          {onToggleFavorite ? (
            <IconButton
              name={favorited ? 'heart' : 'heart-outline'}
              size={18}
              color={favorited ? colors.primary[500] : colors.stone[600]}
              className="absolute right-3 top-3 h-8 w-8 bg-white"
              onPress={onToggleFavorite}
              accessibilityLabel={favorited ? 'Remove from favorites' : 'Save to favorites'}
            />
          ) : null}
        </View>
        <View className="gap-1">
          <AppText className="font-heading-semibold text-lg text-stone-900" numberOfLines={2}>
            {tool.title}
          </AppText>
          <AppText className="font-body text-sm text-stone-600" numberOfLines={1}>
            {ownerLine}
          </AppText>
          <View className="flex-row items-center gap-1">
            {tool.rating > 0 ? <Rating value={tool.rating} size={14} /> : null}
            {distanceMiles != null ? (
              <View className="flex-row items-center gap-1">
                {tool.rating > 0 ? <AppText variant="body-sm">·</AppText> : null}
                <Icon name="location-outline" size={13} color={colors.stone[600]} />
                <AppText className="font-body text-sm text-stone-600">
                  {distanceMiles.toFixed(1)} miles away
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
        {price != null ? (
          <View className="flex-row items-baseline gap-1">
            <AppText className="font-body-bold text-lg text-primary-500">${price}</AppText>
            <AppText className="font-body text-sm text-stone-600">{priceUnit}</AppText>
          </View>
        ) : (
          <AppText className="font-body-bold text-sm text-stone-600">Contact for price</AppText>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      className="mb-5 rounded-md bg-surface"
      // Figma: 0 4 12 rgba(0,0,0,0.05) — set natively; arbitrary shadow classes don't map
      // on RN, and iOS clips shadows under overflow-hidden (kept off this outer view).
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
      onPress={goToTool}
    >
      <View className="h-[240px] w-full overflow-hidden rounded-t-md">
        <Image
          source={tool.photo_urls[0] ?? null}
          style={{ width: '100%', height: 240 }}
          contentFit="cover"
          transition={200}
        />
        {tool.category?.name ? (
          <View className="absolute left-3 top-3 rounded-xs bg-primary-500 px-2 py-1">
            <AppText className="font-heading text-micro uppercase text-white">
              {tool.category.name}
            </AppText>
          </View>
        ) : null}
      </View>
      <View className="gap-3 p-4">
        <View className="gap-1">
          <AppText className="font-heading-semibold text-lg text-stone-900" numberOfLines={2}>
            {tool.title}
          </AppText>
          <AppText className="font-body text-13 text-stone-600" numberOfLines={1}>
            {ownerLine}
          </AppText>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            {tool.rating > 0 ? (
              <Rating value={tool.rating} full size={14} />
            ) : (
              <AppText variant="caption">No reviews yet</AppText>
            )}
            {price != null ? (
              <View className="flex-row items-baseline gap-1">
                <AppText className="font-heading text-xl text-primary-500">${price}</AppText>
                <AppText className="font-heading-regular text-sm text-stone-600">{priceUnit}</AppText>
              </View>
            ) : (
              <AppText className="font-heading text-sm text-stone-600">Contact for price</AppText>
            )}
          </View>
          {onToggleFavorite ? (
            <IconButton
              name={favorited ? 'heart' : 'heart-outline'}
              color={colors.primary[500]}
              className="bg-background"
              onPress={onToggleFavorite}
              accessibilityLabel={favorited ? 'Remove from favorites' : 'Save to favorites'}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
