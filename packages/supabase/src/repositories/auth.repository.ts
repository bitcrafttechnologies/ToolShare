import type { SupabaseClient, User } from '@supabase/supabase-js';

export function createAuthRepository(supabase: SupabaseClient) {
  return {
    async getCurrentUser(): Promise<User | null> {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },

    getCurrentUserId(): string | null {
      return null; // resolved async via getCurrentUser
    },

    async signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
    },

    async signInWithEmail(email: string, password: string): Promise<void> {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async signInWithOtp(phone: string): Promise<void> {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
    },

    async verifyOtp(phone: string, token: string): Promise<void> {
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw error;
    },

    async resetPassword(email: string, redirectTo?: string): Promise<void> {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : {},
      );
      if (error) throw error;
    },

    async signOut(): Promise<void> {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    onAuthStateChange(callback: (user: User | null) => void) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;
