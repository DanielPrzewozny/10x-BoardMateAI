import { useState } from 'react';
import type { GameRecommendation } from '@/types';
import { supabaseClient } from '@/db/supabase.client';
import { GamesService } from '@/lib/services/games.service';

interface UseFavoriteGamesResult {
  addToFavorites: (game: GameRecommendation) => Promise<boolean>;
  removeFromFavorites: (gameTitle: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useFavoriteGames(): UseFavoriteGamesResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gamesService = new GamesService();

  const addToFavorites = async (game: GameRecommendation): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      
      if (!userData || !userData.user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      // Dodaj lub znajdź grę w bazie
      const gameId = await gamesService.addGameFromRecommendation(game);

      // Dodaj do ulubionych
      await gamesService.addToFavorites(userData.user.id, gameId, game.description);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas dodawania do ulubionych';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromFavorites = async (gameTitle: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      
      if (!userData || !userData.user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      // Znajdź ID gry
      const game = await gamesService.getGameByTitle(gameTitle);

      // Usuń z ulubionych
      await gamesService.removeFromFavorites(userData.user.id, game.id);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania z ulubionych';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addToFavorites,
    removeFromFavorites,
    isLoading,
    error
  };
} 