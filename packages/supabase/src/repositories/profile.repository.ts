import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '@toolshare/types';

export function createProfileRepository(supabase: SupabaseClient) {
  return {
    async getProfile(userId: string): Promise<Profile | null> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },

    async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();
      if (error) throw error;
      return data as Profile;
    },

    async uploadAvatar(userId: string, file: File | Blob, mimeType: string): Promise<string> {
      const fileName = `avatars/${userId}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, contentType: mimeType });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    },

    async uploadVerificationDoc(
      userId: string,
      file: File | Blob,
      docType: 'license' | 'id',
      mimeType: string,
    ): Promise<void> {
      const fileName = `${userId}/${docType}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, file, { upsert: false, contentType: mimeType });
      if (uploadError) throw uploadError;

      const field = docType === 'license' ? 'license_url' : 'age_verification_doc_url';
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: fileName })
        .eq('id', userId);
      if (error) throw error;
    },

    async updatePushToken(userId: string, expoPushToken: string): Promise<void> {
      const { error } = await supabase
        .from('profiles')
        .update({ expo_push_token: expoPushToken })
        .eq('id', userId);
      if (error) throw error;
    },
  };
}

export type ProfileRepository = ReturnType<typeof createProfileRepository>;
