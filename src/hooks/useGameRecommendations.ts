import { useState, useCallback } from "react";
import { supabaseClient } from "@/db/supabase.client";
import type { GameRecommendationDTO, GameRecommendationItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface UseGameRecommendationsState {
  recommendations: GameRecommendationDTO[];
  isLoading: boolean;
  error: string | null;
}

interface UseGameRecommendationsActions {
  addRecommendation: (recommendation: GameRecommendationItem) => Promise<boolean>;
  removeRecommendation: (recommendationId: string) => Promise<boolean>;
  getRecommendations: () => Promise<void>;
}

export type UseGameRecommendationsResult = UseGameRecommendationsState & UseGameRecommendationsActions;

export function useGameRecommendations(): UseGameRecommendationsResult {
  const [recommendations, setRecommendations] = useState<GameRecommendationDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabaseClient.auth.getUser();

      if (!userData || !userData.user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      const userId = userData.user.id;
      const { data, error: fetchError } = await supabaseClient
        .from("game_recommendations")
        .select(
          `
          *,
          game:board_games (
            id,
            title,
            complexity,
            min_players,
            max_players,
            duration
          )
        `
        )
        .eq("user_id", userId)
        .order("played_at", { ascending: false });

      if (fetchError) {
        throw new Error(`Błąd podczas pobierania rekomendacji: ${fetchError.message}`);
      }

      setRecommendations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeRecommendation = async (recommendationId: string) => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabaseClient.auth.getUser();

      if (!userData || !userData.user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      // Optymalizacja: Usuń rekord bezpośrednio i sprawdź czy coś zostało usunięte
      // Wykorzystuje indeks idx_game_recommendations_user_id_id
      const {
        data: deletedData,
        error: deleteError,
        count,
      } = await supabaseClient
        .from("game_recommendations")
        .delete()
        .eq("id", recommendationId)
        .eq("user_id", userData.user.id)
        .select()
        .maybeSingle();

      if (deleteError) {
        console.error("Błąd podczas usuwania rekomendacji:", deleteError);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć rekomendacji",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      if (!deletedData) {
        // Nic nie zostało usunięte - rekomendacja nie istnieje lub nie należy do użytkownika
        toast({
          title: "Błąd",
          description: "Rekomendacja nie istnieje lub nie masz do niej dostępu",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      // Aktualizacja lokalnego stanu
      setRecommendations((prev) => prev.filter((rec) => rec.id !== recommendationId));

      toast({
        title: "Sukces",
        description: "Rekomendacja została usunięta",
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Nieoczekiwany błąd podczas usuwania rekomendacji:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const addRecommendation = async (recommendation: GameRecommendationItem): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Zapisywanie rekomendacji:", recommendation);

      const { data: userData } = await supabaseClient.auth.getUser();

      if (!userData || !userData.user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      // Upewnij się, że mamy poprawny identyfikator gry
      //const gameId = recommendation.game_id || recommendation.id;
      //if (!gameId) {
      //  throw new Error('Brak identyfikatora gry do zapisania');
      //}

      // Upewnij się, że typy są tablicą
      const types = Array.isArray(recommendation.types) ? recommendation.types : [];

      // Przygotuj dane do zapisu - różne bazy danych mogą mieć różne ograniczenia
      // dotyczące typów danych, więc upewnij się, że przekazujemy odpowiednie typy
      const recommendationData = {
        user_id: userData.user.id,
        interaction_type: "recommended",
        duration_played: 0,
        session_duration: 0,
        notes: recommendation.description || null,
        played_at: new Date().toISOString(),
        title: recommendation.title || null,
        // Dodatkowe informacje z rekomendacji - upewnij się, że są odpowiedniego typu
        complexity: typeof recommendation.complexity === "number" ? recommendation.complexity : null,
        players: recommendation.players || null,
        duration: recommendation.duration || null,
        types: types.length > 0 ? types : null,
      };

      console.log("Dane do zapisu:", recommendationData);

      const { error: insertError } = await supabaseClient.from("game_recommendations").insert(recommendationData);

      if (insertError) {
        console.error("Błąd podczas zapisywania rekomendacji:", insertError);
        throw new Error(`Błąd podczas dodawania rekomendacji: ${insertError.message}`);
      }

      // Odśwież listę
      await getRecommendations();
      return true;
    } catch (err) {
      console.error("Wyjątek podczas zapisywania rekomendacji:", err);
      setError(err instanceof Error ? err.message : "Nieznany błąd");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    addRecommendation,
    removeRecommendation,
    getRecommendations,
  };
}
