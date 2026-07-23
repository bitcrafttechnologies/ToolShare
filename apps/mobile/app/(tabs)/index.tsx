import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCategories, useFavoriteToolIds, useTools, useToggleFavorite } from '@toolshare/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useLocation } from '@/hooks/useLocation';
import { ToolCard } from '@/components/ToolCard';
import {
  AppText,
  Chip,
  EmptyState,
  IconButton,
  SkeletonToolCard,
  TextField,
} from '@/components/ui';
import { categoryColor } from '@/theme';

// Figma dashboard-feed-mobile (2015:217): brand bar (menu / wordmark / search),
// intro copy, vertical feed of large tool cards. Search icon expands an inline
// search field + category rail (per design annotation).
export default function HomeScreen() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: categories = [] } = useCategories(supabase);
  const { data: tools = [], isLoading } = useTools(supabase, {
    lat: location.latitude,
    lng: location.longitude,
    radiusMiles: 75,
  });
  const { data: favoriteIds } = useFavoriteToolIds(supabase, user?.id);
  const toggleFavorite = useToggleFavorite(supabase, user?.id);

  const submitSearch = () => {
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* Brand bar */}
      <View className="h-14 flex-row items-center justify-between border-b border-border px-6">
        {/* Nav drawer pending design (Figma annotation on 2015:386) */}
        <IconButton name="menu-outline" size={24} className="-ml-2 h-10 w-10" />
        <AppText className="font-heading-extrabold text-xl text-primary-500">ToolShare</AppText>
        <IconButton
          name={searchOpen ? 'close-outline' : 'search-outline'}
          size={24}
          className="-mr-2 h-10 w-10"
          onPress={() => setSearchOpen((open) => !open)}
          accessibilityLabel={searchOpen ? 'Close search' : 'Search'}
        />
      </View>

      {searchOpen ? (
        <View className="gap-3 border-b border-border px-6 pb-4 pt-3">
          <TextField
            leftIcon="search-outline"
            placeholder="Search tools, categories or projects…"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            autoFocus
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Chip
                label={item.name}
                iconName={item.icon_name}
                accent={categoryColor(item.slug)}
                onPress={() => router.push(`/search?category=${item.id}`)}
              />
            )}
          />
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={{ padding: 24 }}
        ListHeaderComponent={
          <View className="mb-6 gap-2">
            <AppText className="font-heading text-2xl text-stone-900">
              Explore tools near you
            </AppText>
            <AppText className="font-body text-sm text-stone-600">
              Rent equipment from your neighborhood community.
            </AppText>
          </View>
        }
        data={tools.slice(0, 20)}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <ToolCard
            tool={item}
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
              icon="construct-outline"
              title="No tools nearby"
              message="Try widening your search or check back soon — new tools are added all the time."
              actionLabel="Browse all tools"
              onAction={() => router.push('/search')}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
