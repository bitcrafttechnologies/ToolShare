'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { TOOL_CONDITION_LABELS, type Tool, type ToolCondition } from '@toolshare/types';
import { useCategories } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ToolPhotoPicker, uploadToolPhotos } from '@/components/ToolPhotoPicker';

const { Button, FormField, Input, Textarea, Select, Checkbox, Alert, Separator } = Components;

export interface ToolFormValues {
  title: string;
  description: string | null;
  category_id: number | null;
  condition: ToolCondition;
  hourly_rate: number | null;
  daily_rate: number | null;
  weekly_rate: number | null;
  deposit_amount: number;
  photo_urls: string[];
  specifications: Record<string, string>;
  address_display: string | null;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_radius_miles: number;
  requires_license: boolean;
  license_type: string | null;
  min_age: number;
  safety_notes: string | null;
}

interface SpecRow {
  key: string;
  value: string;
}

interface Props {
  /** Signed-in owner id, used for the photo upload path. */
  userId: string;
  /** Prefill for edit mode. */
  initial?: Tool | null;
  submitLabel: string;
  /** Persists the values (insert or update) and navigates. Throw to show an error. */
  onSubmit: (values: ToolFormValues) => Promise<void>;
}

const numOrNull = (s: string): number | null => (s.trim() === '' ? null : Number(s));

/**
 * The listing form, shared by /add-tool and /tools/[id]/edit so the two can't
 * drift. Owns photo state — existing URLs (edit) shown alongside newly picked
 * files — and uploads new files on submit before handing final photo_urls to
 * `onSubmit`.
 */
export function ToolForm({ userId, initial, submitLabel, onSubmit }: Props) {
  const supabase = getSupabaseBrowserClient();
  const { data: categories = [] } = useCategories(supabase);

  const [existingPhotos, setExistingPhotos] = useState<string[]>(initial?.photo_urls ?? []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ? String(initial.category_id) : '');
  const [condition, setCondition] = useState<ToolCondition>(initial?.condition ?? 'good');

  // "What's included" — the tool detail page renders these key/value pairs.
  const [specs, setSpecs] = useState<SpecRow[]>(
    Object.entries(initial?.specifications ?? {}).map(([key, value]) => ({ key, value })),
  );

  const [hourlyRate, setHourlyRate] = useState(initial?.hourly_rate != null ? String(initial.hourly_rate) : '');
  const [dailyRate, setDailyRate] = useState(initial?.daily_rate != null ? String(initial.daily_rate) : '');
  const [weeklyRate, setWeeklyRate] = useState(initial?.weekly_rate != null ? String(initial.weekly_rate) : '');
  const [depositAmount, setDepositAmount] = useState(initial?.deposit_amount != null ? String(initial.deposit_amount) : '');

  const [addressDisplay, setAddressDisplay] = useState(initial?.address_display ?? '');
  const [pickupAvailable, setPickupAvailable] = useState(initial?.pickup_available ?? true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(initial?.delivery_available ?? false);
  const [deliveryRadiusMiles, setDeliveryRadiusMiles] = useState(
    initial?.delivery_radius_miles ? String(initial.delivery_radius_miles) : '',
  );

  const [requiresLicense, setRequiresLicense] = useState(initial?.requires_license ?? false);
  const [licenseType, setLicenseType] = useState(initial?.license_type ?? '');
  const [minAge, setMinAge] = useState(initial?.min_age ? String(initial.min_age) : '18');
  const [safetyNotes, setSafetyNotes] = useState(initial?.safety_notes ?? '');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateSpec = (i: number, field: keyof SpecRow, value: string) =>
    setSpecs((prev) => prev.map((row, j) => (j === i ? { ...row, [field]: value } : row)));
  const addSpec = () => setSpecs((prev) => [...prev, { key: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, j) => j !== i));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // A tool with neither pickup nor delivery can't actually change hands.
    if (!pickupAvailable && !deliveryAvailable) {
      setError('Offer at least one of pickup or delivery so renters can get the tool.');
      return;
    }

    setSaving(true);
    try {
      const uploaded = newPhotos.length ? await uploadToolPhotos(supabase, userId, newPhotos) : [];
      const specifications = Object.fromEntries(
        specs
          .map((s) => [s.key.trim(), s.value.trim()] as const)
          .filter(([key]) => key.length > 0),
      );
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId ? Number(categoryId) : null,
        condition,
        hourly_rate: numOrNull(hourlyRate),
        daily_rate: numOrNull(dailyRate),
        weekly_rate: numOrNull(weeklyRate),
        deposit_amount: numOrNull(depositAmount) ?? 0,
        photo_urls: [...existingPhotos, ...uploaded],
        specifications,
        address_display: addressDisplay.trim() || null,
        pickup_available: pickupAvailable,
        delivery_available: deliveryAvailable,
        delivery_radius_miles:
          deliveryAvailable && deliveryRadiusMiles ? Number(deliveryRadiusMiles) : 0,
        requires_license: requiresLicense,
        license_type: requiresLicense && licenseType.trim() ? licenseType.trim() : null,
        min_age: Number(minAge) || 18,
        safety_notes: safetyNotes.trim() || null,
      });
      // onSubmit navigates on success; keep the button disabled through the
      // transition so it can't be double-submitted.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold">Photos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Clear photos get more bookings. Add a few from different angles.
          </p>
        </div>

        {existingPhotos.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Current photos</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {existingPhotos.map((url, i) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-surface-muted"
                >
                  <Image src={url} alt={`Current photo ${i + 1}`} fill className="object-cover" sizes="120px" />
                  {i === 0 ? (
                    <span className="absolute left-1 top-1 rounded-sm bg-stone-900/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-50">
                      Cover
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Remove current photo ${i + 1}`}
                    onClick={() => setExistingPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-stone-900/70 text-stone-50 hover:bg-stone-900"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Add more below.</p>
          </div>
        ) : null}

        <ToolPhotoPicker files={newPhotos} onChange={setNewPhotos} disabled={saving} />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold">Basic info</h2>

        <FormField label="Title" required>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. DeWalt 20V Circular Saw"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the tool, what's included, any quirks to know about..."
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Condition">
            <Select value={condition} onChange={(e) => setCondition(e.target.value as ToolCondition)}>
              {(Object.keys(TOOL_CONDITION_LABELS) as ToolCondition[]).map((c) => (
                <option key={c} value={c}>
                  {TOOL_CONDITION_LABELS[c]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold">What&apos;s included</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accessories, attachments or specs that come with the tool — shown on the listing.
          </p>
        </div>

        {specs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {specs.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  aria-label={`Item ${i + 1} name`}
                  placeholder="Item (e.g. Battery)"
                  value={row.key}
                  onChange={(e) => updateSpec(i, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  aria-label={`Item ${i + 1} detail`}
                  placeholder="Detail (e.g. 2× 5.0Ah)"
                  value={row.value}
                  onChange={(e) => updateSpec(i, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${i + 1}`}
                  onClick={() => removeSpec(i)}
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <div>
          <Button type="button" variant="outline" size="sm" onClick={addSpec}>
            <Plus size={16} aria-hidden="true" />
            Add item
          </Button>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold">Pricing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the rates you want to charge. Leave one blank to disable that rental period.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Hourly rate ($)">
            <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="0" step="0.01" placeholder="0.00" />
          </FormField>
          <FormField label="Daily rate ($)">
            <Input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} min="0" step="0.01" placeholder="0.00" />
          </FormField>
          <FormField label="Weekly rate ($)">
            <Input type="number" value={weeklyRate} onChange={(e) => setWeeklyRate(e.target.value)} min="0" step="0.01" placeholder="0.00" />
          </FormField>
        </div>

        <FormField
          label="Security deposit ($)"
          className="max-w-xs"
          helperText="Held when a rental starts and released on return."
        >
          <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} min="0" step="0.01" placeholder="0.00" />
        </FormField>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold">Location &amp; delivery</h2>

        <FormField label="Address / area">
          <Input type="text" value={addressDisplay} onChange={(e) => setAddressDisplay(e.target.value)} placeholder="e.g. Tempe, AZ 85281" />
        </FormField>

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={pickupAvailable} onChange={(e) => setPickupAvailable(e.target.checked)} />
            <span className="text-sm font-medium">Pickup available</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={deliveryAvailable} onChange={(e) => setDeliveryAvailable(e.target.checked)} />
            <span className="text-sm font-medium">Delivery available</span>
          </label>
        </div>

        {!pickupAvailable && !deliveryAvailable ? (
          <p className="text-sm text-danger-600">
            Choose at least one — renters need a way to get the tool.
          </p>
        ) : null}

        {deliveryAvailable ? (
          <FormField label="Delivery radius (miles)" className="max-w-xs">
            <Input type="number" value={deliveryRadiusMiles} onChange={(e) => setDeliveryRadiusMiles(e.target.value)} min="1" placeholder="e.g. 25" />
          </FormField>
        ) : null}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold">Requirements &amp; safety</h2>

        <FormField
          label="Minimum renter age"
          className="max-w-xs"
          helperText="Arizona requires 21+ for aerial lifts and some heavy machinery."
        >
          <Input type="number" value={minAge} onChange={(e) => setMinAge(e.target.value)} min="18" max="99" />
        </FormField>

        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox checked={requiresLicense} onChange={(e) => setRequiresLicense(e.target.checked)} />
          <span className="text-sm font-medium">Renter must have a license / certification</span>
        </label>

        {requiresLicense ? (
          <FormField label="License / certification type">
            <Input type="text" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} placeholder="e.g. Aerial work platform (OSHA 1926.453)" />
          </FormField>
        ) : null}

        <FormField label="Safety notes">
          <Textarea value={safetyNotes} onChange={(e) => setSafetyNotes(e.target.value)} rows={3} placeholder="Any safety precautions or PPE requirements renters should know..." />
        </FormField>
      </section>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Button type="submit" size="lg" isLoading={saving} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
