import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useCreateTool } from '@toolshare/supabase';
import { createProfileRepository } from '@toolshare/supabase';
import type { ToolCondition } from '@toolshare/types';
import { TOOL_CONDITION_LABELS } from '@toolshare/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

const CONDITIONS: ToolCondition[] = ['like_new', 'good', 'fair', 'heavy_use'];

export default function PostToolScreen() {
  const { user } = useAuthStore();
  const createTool = useCreateTool(supabase);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [condition, setCondition] = useState<ToolCondition>('good');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !dailyRate || !user) return;
    setError(null);
    setUploading(true);

    try {
      let photoUrls: string[] = [];
      if (photoUri) {
        const profileRepo = createProfileRepository(supabase);
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const fileName = `tools/${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('tools')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });
        if (!uploadError) {
          const { data } = supabase.storage.from('tools').getPublicUrl(fileName);
          photoUrls = [data.publicUrl];
        }
      }

      await createTool.mutateAsync({
        owner_id: user.id,
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        category_id: 1,
        condition,
        daily_rate: parseFloat(dailyRate),
        deposit_amount: parseFloat(depositAmount) || 0,
        photo_urls: photoUrls,
      });

      Alert.alert('Success', 'Your tool has been listed!', [
        { text: 'OK', onPress: () => router.replace('/my-listings') },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      <Text className="mb-6 text-xl font-semibold">List a tool</Text>

      {error && (
        <View className="mb-4 rounded-xl bg-red-50 p-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        className="mb-5 h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
        onPress={pickImage}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} contentFit="cover" />
        ) : (
          <View className="items-center">
            <Text className="text-4xl">📷</Text>
            <Text className="mt-2 text-sm text-gray-500">Add a photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium">Tool name *</Text>
        <TextInput
          className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          placeholder="e.g. DeWalt 20V Drill"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium">Description</Text>
        <TextInput
          className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          placeholder="Describe the tool, included accessories, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1">
          <Text className="mb-1 text-sm font-medium">Daily rate ($) *</Text>
          <TextInput
            className="rounded-xl border border-gray-300 px-4 py-3 text-base"
            placeholder="25"
            value={dailyRate}
            onChangeText={setDailyRate}
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-sm font-medium">Deposit ($)</Text>
          <TextInput
            className="rounded-xl border border-gray-300 px-4 py-3 text-base"
            placeholder="50"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Condition</Text>
        <View className="flex-row flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              className={`rounded-lg border px-4 py-2 ${condition === c ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
              onPress={() => setCondition(c)}
            >
              <Text className={condition === c ? 'font-medium text-primary-500' : 'text-gray-700'}>
                {TOOL_CONDITION_LABELS[c]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="rounded-xl bg-primary-500 py-4 disabled:opacity-40"
        onPress={handleSubmit}
        disabled={!title.trim() || !dailyRate || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-center font-semibold text-white">List tool</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
