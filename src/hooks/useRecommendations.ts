import { useState } from 'react';
import type { GameDescriptionCommand, GameDescriptionResponseDto } from '@/types';

interface UseRecommendationsResult {
  recommendations: GameDescriptionResponseDto | null;
  isLoading: boolean;
  error: string | null;
  getRecommendations: (data: GameDescriptionCommand) => Promise<void>;
}

export function useRecommendations(): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<GameDescriptionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (data: GameDescriptionCommand): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas pobierania rekomendacji');
      }

      const recommendationsData = await response.json();
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
  };
} 