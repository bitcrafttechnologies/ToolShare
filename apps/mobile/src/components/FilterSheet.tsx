import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Category } from '@toolshare/types';
import { AppText, Button, Chip, TextField, Toggle } from '@/components/ui';
import { categoryColor } from '@/theme';

export interface ToolFilters {
  categoryId?: number | undefined;
  maxPrice?: number | undefined;
  radiusMiles: number;
  deliveryOnly: boolean;
}

export const DEFAULT_FILTERS: ToolFilters = {
  categoryId: undefined,
  maxPrice: undefined,
  radiusMiles: 75,
  deliveryOnly: false,
};

/** Count of filters differing from defaults — drives the nav badge. */
export function activeFilterCount(filters: ToolFilters): number {
  let count = 0;
  if (filters.categoryId != null) count += 1;
  if (filters.maxPrice != null) count += 1;
  if (filters.radiusMiles !== DEFAULT_FILTERS.radiusMiles) count += 1;
  if (filters.deliveryOnly) count += 1;
  return count;
}

const RADIUS_OPTIONS = [10, 25, 50, 75];

interface FilterSheetProps {
  visible: boolean;
  filters: ToolFilters;
  categories: Category[];
  resultCount: number;
  onApply: (filters: ToolFilters) => void;
  onClose: () => void;
}

// Figma filter-peek (2031:80) expanded: handle, title + Clear all, filter
// controls, full-width apply button.
export function FilterSheet({
  visible,
  filters,
  categories,
  resultCount,
  onApply,
  onClose,
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<ToolFilters>(filters);

  // Re-seed the draft each time the sheet opens so a dismissed edit is discarded.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className="rounded-t-lg bg-surface px-6 pt-3"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="mb-5 h-1 w-10 self-center rounded-full bg-border" />
        <View className="mb-5 flex-row items-center justify-between">
          <AppText className="font-heading text-2xl text-stone-900">Filters</AppText>
          <Pressable onPress={() => setDraft(DEFAULT_FILTERS)} hitSlop={8}>
            <AppText className="font-body-semibold text-sm text-primary-500">Clear all</AppText>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[420px]">
          <AppText variant="label" className="mb-2">
            Category
          </AppText>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                iconName={category.icon_name}
                accent={categoryColor(category.slug)}
                selected={draft.categoryId === category.id}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    categoryId: d.categoryId === category.id ? undefined : category.id,
                  }))
                }
              />
            ))}
          </View>

          <TextField
            label="Max price per day"
            placeholder="Any price"
            keyboardType="number-pad"
            value={draft.maxPrice != null ? String(draft.maxPrice) : ''}
            onChangeText={(text) => {
              const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
              setDraft((d) => ({ ...d, maxPrice: Number.isNaN(parsed) ? undefined : parsed }));
            }}
            className="mb-6"
          />

          <AppText variant="label" className="mb-2">
            Search radius
          </AppText>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {RADIUS_OPTIONS.map((miles) => (
              <Chip
                key={miles}
                label={`${miles} mi`}
                selected={draft.radiusMiles === miles}
                onPress={() => setDraft((d) => ({ ...d, radiusMiles: miles }))}
              />
            ))}
          </View>

          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <AppText className="font-body-medium text-base text-stone-900">
                Delivery available
              </AppText>
              <AppText variant="caption">Only show tools the owner will deliver</AppText>
            </View>
            <Toggle
              value={draft.deliveryOnly}
              onChange={(value) => setDraft((d) => ({ ...d, deliveryOnly: value }))}
            />
          </View>
        </ScrollView>

        <Button
          label={`Show ${resultCount} result${resultCount === 1 ? '' : 's'}`}
          className="mt-5"
          onPress={() => {
            onApply(draft);
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}
