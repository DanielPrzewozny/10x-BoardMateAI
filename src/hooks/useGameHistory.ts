import { useState } from 'react';
import type { GameRecommendation } from '@/types';
import { supabaseClient } from '@/db/supabase.client';

interface UseGameHistoryResult {
  saveToHistory: (recommendation: GameRecommendation) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useGameHistory(): UseGameHistoryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToHistory = async (recommendation: GameRecommendation): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      
      if (!userData || !userData.user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      // Konwersja czasu gry z formatu '30-60' do liczby (użyjemy średniej)
      let durationValue = 60; // Domyślna wartość
      
      if (recommendation.duration) {
        const durationParts = recommendation.duration.split('-');
        if (durationParts.length === 2) {
          const min = parseInt(durationParts[0], 10);
          const max = parseInt(durationParts[1], 10);
          if (!isNaN(min) && !isNaN(max)) {
            durationValue = Math.floor((min + max) / 2);
          }
        } else {
          const singleValue = parseInt(recommendation.duration, 10);
          if (!isNaN(singleValue)) {
            durationValue = singleValue;
          }
        }
      }

      const historyEntry = {
        user_id: userData.user.id,
        interaction_type: 'recommended' as const,
        played_at: new Date().toISOString(),
        notes: `${recommendation.title}: ${recommendation.description}`,
        duration_played: durationValue,
        session_duration: durationValue,
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