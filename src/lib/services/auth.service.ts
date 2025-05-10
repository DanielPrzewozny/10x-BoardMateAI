import { supabaseClient } from "@/db/supabase.client";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { secureStorage } from "@/lib/utils/secureStorage";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const SESSION_KEY = "sb-access-token";
const SUPABASE_AUTH_TOKEN_KEY = "supabase.auth.token";
const SUPABASE_AUTH_STATE_KEY = "supabase.auth.token.type";
const SUPABASE_COOKIES = ["sb-refresh-token", "sb-access-token", "sb-auth-token"];

// Funkcja pomocnicza do czyszczenia wszystkich danych w pamięci podręcznej
const clearAllStorageData = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    // Czyścimy localStorage
    if (typeof window !== "undefined") {
      // Usuń dane sesji
      secureStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(SUPABASE_AUTH_TOKEN_KEY);
      window.localStorage.removeItem(SUPABASE_AUTH_STATE_KEY);

      // Inne klucze Supabase, które mogą być używane
      window.localStorage.removeItem("supabase.auth.expires_at");
      window.localStorage.removeItem("supabase.auth.token");

      // Spróbuj usunąć wszystkie klucze zaczynające się od sb-
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          window.localStorage.removeItem(key);
        }
      });

      // Wyczyść localStorage dla obecnego hosta
      try {
        const host = window.location.hostname;
        window.localStorage.removeItem(`sb-${host}-auth-token`);
      } catch (e) {
        console.error("Błąd podczas czyszczenia localStorage dla hosta:", e);
      }
    }

    // Czyścimy ciasteczka
    if (typeof document !== "undefined") {
      // Usuń wszystkie ciasteczka
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Dodatkowo usuń konkretne ciasteczka Supabase
      SUPABASE_COOKIES.forEach((cookieName) => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }

    resolve();
  });
};

export const authService = {
  async signIn(email: string, password: string) {
    try {
      // Przed logowaniem wyczyść poprzednią sesję
      await clearAllStorageData();

      // Zaloguj użytkownika
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AuthError(error.message);
      }

      if (!data.session) {
        throw new AuthError("Nie udało się utworzyć sesji");
      }

      // Zapisz całą sesję w localStorage
      secureStorage.setItem(SESSION_KEY, data.session);
      console.log("Login successful, session:", data.session);

      return data;
    } catch (error) {
      console.error("Błąd podczas logowania:", error);
      throw error;
    }
  },

  async signOut() {
    try {
      console.log("Rozpoczynam proces wylogowania...");

      // Najpierw wyloguj z Supabase
      const { error: signOutError } = await supabaseClient.auth.signOut({ scope: "global" });

      if (signOutError) {
        console.error("Błąd podczas wylogowywania z Supabase:", signOutError);
      }

      // Zresetuj klienta Supabase
      try {
        await supabaseClient.auth.initialize();
      } catch (initError) {
        console.error("Błąd podczas reinicjalizacji Supabase:", initError);
      }

      // Wyczyść wszystkie dane
      await clearAllStorageData();

      console.log("Proces wylogowania zakończony, przekierowuję...");

      // Zwracamy Promise, który zostanie rozwiązany przed przekierowaniem
      return new Promise<void>((resolve) => {
        // Dajemy czas na zaktualizowanie UI
        setTimeout(() => {
          // Odśwież stronę, aby zresetować stan aplikacji
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          resolve();
        }, 100);
      });
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
      throw error;
    }
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    if (error) {
      throw new AuthError(error.message);
    }
    return session;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: any) => void) {
    return supabaseClient.auth.onAuthStateChange(callback);
  },

  // Eksportujemy funkcję pomocniczą
  clearAllStorageData,
};
