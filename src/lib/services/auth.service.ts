import { supabaseClient } from '@/db/supabase.client';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthError(error.message);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw new AuthError(error.message);
    }
  },

  getSession() {
    return supabaseClient.auth.getSession();
  },

  onAuthStateChange(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => void) {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}; 