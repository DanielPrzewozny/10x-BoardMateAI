import { useState } from 'react';
import type { GameDescriptionResponseDto } from '@/types';
import { supabaseClient } from '@/db/supabase.client';

interface UseGameHistoryResult {
  saveToHistory: (recommendation: GameDescriptionResponseDto) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useGameHistory(): UseGameHistoryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToHistory = async (recommendation: GameDescriptionResponseDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      
      if (!userData || !userData.user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      const historyEntry = {
        user_id: userData.user.id,
        interaction_type: 'recommended' as const,
        played_at: new Date().toISOString(),
        notes: recommendation.description,
        duration_played: recommendation.duration,
        session_duration: recommendation.duration,
        score: 0
      };

      const { error: dbError } = await supabaseClient
        .from('game_history')
        .insert(historyEntry);

      if (dbError) {
        throw new Error(`Błąd podczas zapisywania do historii: ${dbError.message}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas zapisywania do historii';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveToHistory,
    isLoading,
    error
  };
} 