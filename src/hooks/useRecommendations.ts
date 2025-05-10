import { useState, useCallback } from "react";
import type { GameDescriptionCommand, GameRecommendationsResponseDto } from "@/types";

interface UseRecommendationsResult {
  recommendations: GameRecommendationsResponseDto | null;
  isLoading: boolean;
  error: string | null;
  getRecommendations: (data: GameDescriptionCommand) => Promise<void>;
}

export function useRecommendations(): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<GameRecommendationsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (data: GameDescriptionCommand): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Wysyłanie zapytania do API z danymi:", data);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Logowanie statusu odpowiedzi
      console.log("Odpowiedź API - status:", response.status);

      // Odczytujemy tekst odpowiedzi
      const responseText = await response.text();
      console.log("Odpowiedź API - raw text:", responseText);

      if (!response.ok) {
        let errorMessage = "Wystąpił błąd podczas pobierania rekomendacji";
        try {
          // Próba parsowania błędu jako JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.error("Błąd API:", errorData);
        } catch (e) {
          console.error("Odpowiedź błędu nie jest w formacie JSON:", responseText);
        }
        throw new Error(errorMessage);
      }

      // Parsujemy tekst odpowiedzi do JSON
      let recommendationsData: GameRecommendationsResponseDto;
      try {
        recommendationsData = JSON.parse(responseText);
        console.log("Odpowiedź API - parsed:", recommendationsData);
      } catch (e) {
        console.error("Nie można sparsować odpowiedzi jako JSON:", responseText, e);
        throw new Error("Otrzymano nieprawidłowy format danych z serwera");
      }

      // Sprawdzamy, czy odpowiedź ma oczekiwaną strukturę
      if (!recommendationsData || !recommendationsData.recommendations) {
        console.error("Odpowiedź API nie zawiera rekomendacji:", recommendationsData);
        throw new Error("Otrzymano nieprawidłowy format danych z serwera");
      }

      setRecommendations(recommendationsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      console.error("Błąd w useRecommendations:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
  };
}
