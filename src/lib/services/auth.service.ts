import { supabaseClient } from '@/db/supabase.client';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { secureStorage } from '@/lib/utils/secureStorage';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const SESSION_KEY = 'sb-access-token';
const SUPABASE_AUTH_TOKEN_KEY = 'supabase.auth.token';
const SUPABASE_AUTH_STATE_KEY = 'supabase.auth.token.type';

export const authService = {
  async signIn(email: string, password: string) {
    // Zaloguj użytkownika
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthError(error.message);
    }

    if (!data.session) {
      throw new AuthError('Nie udało się utworzyć sesji');
    }

    // Zapisz całą sesję w localStorage
    secureStorage.setItem(SESSION_KEY, data.session);
    console.log('Login successful, session:', data.session);
    
    return data;
  },

  async signOut() {
    try {
      // Najpierw wyloguj z Supabase i zaczekaj na potwierdzenie
      const signOutPromise = supabaseClient.auth.signOut();
      const initializePromise = supabaseClient.auth.initialize();
      
      // Czekamy na zakończenie obu operacji
      const [signOutResult] = await Promise.all([
        signOutPromise,
        initializePromise
      ]);

      if (signOutResult.error) {
        throw new AuthError(signOutResult.error.message);
      }

      // Teraz możemy wyczyścić lokalne dane
      const clearLocalDataPromises = [
        // Czyścimy localStorage
        new Promise<void>(resolve => {
          secureStorage.removeItem(SESSION_KEY);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(SUPABASE_AUTH_TOKEN_KEY);
            window.localStorage.removeItem(SUPABASE_AUTH_STATE_KEY);
          }
          resolve();
        }),
        // Czyścimy ciasteczka
        new Promise<void>(resolve => {
          if (typeof document !== 'undefined') {
            document.cookie.split(";").forEach((c) => {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
          }
          resolve();
        })
      ];

      // Czekamy na wyczyszczenie wszystkich danych
      await Promise.all(clearLocalDataPromises);

      // Zwracamy Promise, który zostanie rozwiązany przed przekierowaniem
      return new Promise<void>(resolve => {
        // Dajemy czas na zaktualizowanie UI
        setTimeout(() => {
          // Odśwież stronę, aby zresetować stan aplikacji
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          resolve();
        }, 100);
      });
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
      throw error;
    }
  },

  async getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
      throw new AuthError(error.message);
    }
    return session;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: any) => void) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }
};