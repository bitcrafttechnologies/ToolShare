import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  useCategories,
  useFavoriteToolIds,
  useTools,
  useToggleFavorite,
} from '@toolshare/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useLocation } from '@/hooks/useLocation';
import { ToolCard } from '@/components/ToolCard';
import {
  DEFAULT_FILTERS,
  FilterSheet,
  activeFilterCount,
  type ToolFilters,
} from '@/components/FilterSheet';
import { AppText, EmptyState, Icon, IconButton, SkeletonToolCard, TextField } from '@/components/ui';
import { colors } from '@/theme';

// Figma search-results-mobile (2031:7): back / title / search + filter nav,
// results bar, borderless card list, filter FAB.
export default function BrowseScreen() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  const initialCategoryId = params.category ? Number(params.category) : undefined;
  const [query, setQuery] = useState(params.q ?? '');
  const [submittedQuery, setSubmittedQuery] = useState(params.q ?? '');
  const [searchOpen, setSearchOpen] = useState(!params.q && !params.category);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ToolFilters>({
    ...DEFAULT_FILTERS,
    ...(initialCategoryId != null && !Number.isNaN(initialCategoryId)
      ? { categoryId: initialCategoryId }
      : {}),
  });

  const { data: categories = [] } = useCategories(supabase);
  const { data: tools = [], isLoading } = useTools(supabase, {
    lat: location.latitude,
    lng: location.longitude,
    radiusMiles: filters.radiusMiles,
    query: submittedQuery || undefined,
    categoryId: filters.categoryId,
  });
  const { data: favoriteIds } = useFavoriteToolIds(supabase, user?.id);
  const toggleFavorite = useToggleFavorite(supabase, user?.id);

  // Price and delivery aren't supported by search_tools_nearby — filter client-side.
  const visibleTools = useMemo(
    () =>
      tools.filter((tool) => {
        if (filters.deliveryOnly && !tool.delivery_available) return false;
        if (filters.maxPrice != null) {
          const price = tool.daily_rate ?? tool.hourly_rate;
          if (price == null || price > filters.maxPrice) return false;
        }
        return true;
      }),
    [tools, filters.deliveryOnly, filters.maxPrice],
  );

  const filterCount = activeFilterCount(filters);
  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const title = submittedQuery || activeCategory?.name || 'Browse tools';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="h-14 flex-row items-center gap-4 border-b border-border px-5">
        <IconButton
          name="arrow-back"
          size={24}
          className="-ml-2 h-10 w-10"
          onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
          accessibilityLabel="Go back"
        />
        <AppText className="flex-1 font-body-semibold text-base text-stone-900" numberOfLines={1}>
          {title}
        </AppText>
        <IconButton
          name={searchOpen ? 'close-outline' : 'search-outline'}
          size={24}
          onPress={() => setSearchOpen((open) => !open)}
          accessibilityLabel={searchOpen ? 'Close search' : 'Search'}
        />
        <Pressable
          hitSlop={8}
          onPress={() => setFilterOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Filters${filterCount ? `, ${filterCount} active` : ''}`}
        >
          <Icon name="options-outline" size={24} color={colors.stone[700]} />
          {filterCount > 0 ? (
            <View className="absolute -right-1.5 -top-1.5 h-4 min-w-4 items-center justify-center rounded-sm bg-primary-500 px-1">
              <AppText className="font-body-bold text-[10px] text-white">{filterCount}</AppText>
            </View>
          ) : null}
        </Pressable>
      </View>

      {searchOpen ? (
        <View className="border-b border-border px-6 py-3">
          <TextField
            leftIcon="search-outline"
            placeholder="Search tools, equipment…"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setSubmittedQuery(query.trim())}
            returnKeyType="search"
            autoFocus={!params.q}
          />
        </View>
      ) : null}

      <View className="flex-row items-center justify-between px-6 py-3">
        <AppText className="font-body text-sm text-stone-600">
          {isLoading
            ? 'Searching…'
            : `${visibleTools.length} tool${visibleTools.length === 1 ? '' : 's'} found`}
        </AppText>
        {filterCount > 0 ? (
          <Pressable hitSlop={8} onPress={() => setFilters(DEFAULT_FILTERS)}>
            <AppText className="font-body-semibold text-sm text-primary-500">Clear filters</AppText>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        data={visibleTools}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <ToolCard
            tool={item}
            variant="list"
            favorited={favoriteIds?.has(item.id) ?? false}
            onToggleFavorite={() =>
              toggleFavorite.mutate({
                toolId: item.id,
                favorited: favoriteIds?.has(item.id) ?? false,
              })
            }
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View>
              <SkeletonToolCard />
              <SkeletonToolCard />
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title={submittedQuery ? `No results for "${submittedQuery}"` : 'No tools found'}
              message="Try a different search, widen your radius, or clear your filters."
              {...(filterCount > 0
                ? { actionLabel: 'Clear filters', onAction: () => setFilters(DEFAULT_FILTERS) }
                : {})}
            />
          )
        }
      />

      <IconButton
        name="options-outline"
        variant="fab"
        className="absolute bottom-6 right-6"
        onPress={() => setFilterOpen(true)}
        accessibilityLabel="Open filters"
      />

      <FilterSheet
        visible={filterOpen}
        filters={filters}
        categories={categories}
        resultCount={visibleTools.length}
        onApply={setFilters}
        onClose={() => setFilterOpen(false)}
      />
    </SafeAreaView>
  );
}
