import { useState, useEffect } from "react";
import { supabaseClient } from "@/db/supabase.client";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/lib/services/auth.service";
import { secureStorage } from "@/lib/utils/secureStorage";

const SESSION_KEY = "sb-access-token";
const isClient = typeof window !== "undefined";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Funkcja do całkowitego czyszczenia stanu i pamięci podręcznej
  const clearAuthState = async () => {
    console.log("useAuth: Czyszczenie stanu autentykacji");
    setUser(null);
    // Używamy funkcji z authService do czyszczenia pamięci podręcznej
    await authService.clearAllStorageData();
  };

  useEffect(() => {
    if (!isClient) {
      console.log("useAuth: Brak klienta (SSR), pomijam inicjalizację");
      setIsLoading(false);
      return;
    }

    async function initializeAuth() {
      console.log("useAuth: Inicjalizacja autentykacji...");
      setIsLoading(true);

      try {
        // Najpierw sprawdź aktualną sesję z API Supabase
        console.log("useAuth: Pobieranie sesji z Supabase...");
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabaseClient.auth.getSession();

        if (sessionError) {
          console.error("useAuth: Błąd pobierania sesji z Supabase:", sessionError);
          // Wyczyść stan w przypadku błędu
          await clearAuthState();
          setIsLoading(false);
          return;
        }

        // Jeśli mamy aktualną sesję, użyj jej
        if (currentSession) {
          console.log("useAuth: Znaleziono aktywną sesję w Supabase dla:", currentSession.user.email);
          // Zapisz aktualną sesję, aby upewnić się, że localStorage jest zsynchronizowany
          secureStorage.setItem(SESSION_KEY, currentSession);
          handleSession(currentSession);
          return;
        }

        // Sprawdź zaszyfrowaną sesję w localStorage
        console.log("useAuth: Brak aktywnej sesji, sprawdzanie localStorage");
        const savedSession = secureStorage.getItem(SESSION_KEY);

        if (savedSession) {
          console.log("useAuth: Znaleziono zapisaną sesję w localStorage dla:", savedSession.user?.email);

          // Sprawdź czy sesja nie wygasła
          if (savedSession.expires_at && savedSession.expires_at * 1000 < Date.now()) {
            console.log("useAuth: Zapisana sesja wygasła, czyszczę localStorage");
            await clearAuthState();
            setIsLoading(false);
            return;
          }

          // Przywróć pełną sesję
          try {
            console.log("useAuth: Próbuję przywrócić sesję z localStorage...");
            const { data, error } = await supabaseClient.auth.setSession(savedSession);

            if (error) {
              console.error("useAuth: Błąd przywracania sesji:", error);
              // Sesja jest nieprawidłowa, wyczyść ją
              await clearAuthState();
            } else if (data.session) {
              console.log("useAuth: Sesja została przywrócona pomyślnie dla:", data.session.user.email);
              // Aktualizuj sesję w localStorage, aby upewnić się, że dane są aktualne
              secureStorage.setItem(SESSION_KEY, data.session);
              handleSession(data.session);
            } else {
              console.error("useAuth: Brak sesji po przywróceniu");
              await clearAuthState();
            }
          } catch (error) {
            console.error("useAuth: Błąd podczas przywracania sesji:", error);
            await clearAuthState();
          }
        } else {
          console.log("useAuth: Brak zapisanej sesji w localStorage");
          await clearAuthState();
        }
      } catch (error) {
        console.error("useAuth: Nieoczekiwany błąd podczas inicjalizacji auth:", error);
        await clearAuthState();
      } finally {
        setLastCheck(new Date());
        setIsLoading(false);
      }
    }

    // Funkcja do obsługi sesji
    function handleSession(session: Session | null) {
      if (session) {
        console.log("useAuth: Ustawianie użytkownika z sesji:", session.user.email);

        // Zapisujemy sesję i ustawiamy użytkownika
        secureStorage.setItem(SESSION_KEY, session);
        setUser(session.user);
      } else {
        console.log("useAuth: Brak sesji, czyszczę dane użytkownika");
        clearAuthState();
      }
    }

    // Inicjalizacja autentykacji
    initializeAuth();

    // Nasłuchuj zmian w stanie autentykacji
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(`useAuth: Zmiana stanu autentykacji: ${event}`, session?.user?.email);

      switch (event) {
        case "SIGNED_OUT":
          console.log("useAuth: Użytkownik wylogował się");
          await clearAuthState();
          break;
        case "SIGNED_IN":
          console.log("useAuth: Użytkownik zalogował się:", session?.user?.email);
          // Najpierw wyczyśćmy poprzedni stan
          await clearAuthState();
          // Teraz ustawmy nowego użytkownika
          if (session) {
            secureStorage.setItem(SESSION_KEY, session);
            setUser(session.user);
          }
          break;
        case "TOKEN_REFRESHED":
          console.log("useAuth: Token został odświeżony");
          if (session) {
            secureStorage.setItem(SESSION_KEY, session);
            setUser(session.user);
          }
          break;
        case "USER_UPDATED":
          console.log("useAuth: Dane użytkownika zaktualizowane");
          if (session) {
            secureStorage.setItem(SESSION_KEY, session);
            setUser(session.user);
          }
          break;
      }

      setLastCheck(new Date());
      setIsLoading(false);
    });

    return () => {
      console.log("useAuth: Czyszczenie subskrypcji");
      subscription.unsubscribe();
    };
  }, []);

  // Dodaj publiczną metodę do ręcznego odświeżania stanu autentykacji
  const refreshAuth = async () => {
    console.log("useAuth: Ręczne odświeżanie stanu autentykacji");
    setIsLoading(true);

    try {
      // Pobierz aktualną sesję
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) {
        console.error("useAuth: Błąd podczas odświeżania sesji:", error);
        await clearAuthState();
      } else if (session) {
        console.log("useAuth: Znaleziono aktywną sesję podczas odświeżania dla:", session.user.email);
        secureStorage.setItem(SESSION_KEY, session);
        setUser(session.user);
      } else {
        // Próbuj odtworzyć sesję z localStorage
        const savedSession = secureStorage.getItem(SESSION_KEY);

        if ((savedSession && !savedSession.expires_at) || savedSession.expires_at * 1000 > Date.now()) {
          console.log("useAuth: Próbuję odtworzyć sesję z localStorage podczas odświeżania...");
          try {
            const { data, error: setSessionError } = await supabaseClient.auth.setSession(savedSession);

            if (setSessionError) {
              console.error("useAuth: Błąd przywracania sesji podczas odświeżania:", setSessionError);
              await clearAuthState();
            } else if (data.session) {
              console.log("useAuth: Sesja została pomyślnie odtworzona podczas odświeżania");
              secureStorage.setItem(SESSION_KEY, data.session);
              setUser(data.session.user);
            }
          } catch (e) {
            console.error("useAuth: Błąd podczas odtwarzania sesji:", e);
            await clearAuthState();
          }
        } else {
          console.log("useAuth: Brak sesji do odtworzenia podczas odświeżania");
          await clearAuthState();
        }
      }
    } catch (e) {
      console.error("useAuth: Nieoczekiwany błąd podczas odświeżania:", e);
      await clearAuthState();
    } finally {
      setLastCheck(new Date());
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    lastCheck,
    clearAuthState,
    refreshAuth,
  };
}
