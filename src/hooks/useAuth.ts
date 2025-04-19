import { useState, useEffect } from 'react';
import { supabaseClient } from '@/db/supabase.client';
import type { User } from '@supabase/supabase-js';
import { authService } from '@/lib/services/auth.service';
import { secureStorage } from '@/lib/utils/secureStorage';

const SESSION_KEY = 'sb-access-token';
const isClient = typeof window !== 'undefined';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isClient) {
      setIsLoading(false);
      return;
    }

    // Sprawdź zaszyfrowaną sesję w localStorage
    const savedSession = secureStorage.getItem(SESSION_KEY);
    
    if (savedSession) {
      // Przywróć pełną sesję
      supabaseClient.auth.setSession(savedSession).then(({ data }) => {
        console.log("Sesja przywrócona:", data.session);
        setUser(data.session?.user ?? null);
      }).catch(error => {
        console.error("Błąd przywracania sesji:", error);
        secureStorage.removeItem(SESSION_KEY);
        setUser(null);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // Nasłuchuj zmian w stanie autentykacji
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      switch (event) {
        case 'SIGNED_OUT':
        case 'INITIAL_SESSION':
          if (!session) {
            secureStorage.removeItem(SESSION_KEY);
            setUser(null);
          }
          break;
        case 'TOKEN_REFRESHED':
        case 'SIGNED_IN':
          if (session) {
            secureStorage.setItem(SESSION_KEY, session);
            setUser(session.user);
          }
          break;
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  };
} 