import type { APIRoute } from "astro";
import type { GameDescriptionCommand } from "../../types";
import { RecommendationService } from "../../lib/recommendation.service";
import { GamesService } from "@/lib/services/games.service";
import { supabaseClient } from "../../db/supabase.client";
import { z } from "zod";

export const prerender = false;

// Schemat walidacji wejścia
const gameDescriptionSchema = z.object({
  description: z.string().min(200).max(10000),
  players: z.number().int().min(1).max(12).optional(),
  duration: z.number().int().min(15).max(240).optional(),
  complexity: z.number().int().min(1).max(5).optional(),
  types: z.array(z.string()).min(1).max(5).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  console.log("POST /api/recommendations został wywołany");

  try {
    const requestData = await request.json();

    // Walidacja danych wejściowych
    const validationResult = gameDescriptionSchema.safeParse(requestData);

    if (!validationResult.success) {
      console.error("Błędne dane wejściowe:", validationResult.error);
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Inicjalizacja serwisu rekomendacji
    const recommendationService = new RecommendationService(supabaseClient);

    try {
      // W trybie testowym użyj mocków
      const useTestMode = import.meta.env.PUBLIC_USE_TEST_MODE === "true";

      // Konwersja danych do wymaganego formatu
      const gameDescription: GameDescriptionCommand = {
        description: validationResult.data.description,
        players: validationResult.data.players || 4, // Domyślna wartość
        duration: validationResult.data.duration || 60, // Domyślna wartość
        complexity: validationResult.data.complexity || 3, // Domyślna wartość
        types: validationResult.data.types || ["strategy"], // Domyślna wartość
      };

      console.log("Generowanie rekomendacji dla danych:", JSON.stringify(gameDescription, null, 2));

      // Pozyskaj rekomendacje
      const recommendationResponse = await recommendationService.getRecommendations(gameDescription);

      // Dodaj szczegółowe logowanie rekomendacji
      console.log(`Otrzymano ${recommendationResponse.recommendations.length} rekomendacji`);
      console.log("Przykładowa rekomendacja:", JSON.stringify(recommendationResponse.recommendations[0], null, 2));

      try {
        // Próba zapisania rekomendacji w bazie danych
        console.log("Rozpoczynam dodawanie gier z rekomendacji do bazy danych...");
        const gamesService = new GamesService();

        // Filtruj i naprawiaj rekomendacje przed zapisem
        const validatedRecommendations = recommendationResponse.recommendations.map((rec) => ({
          ...rec,
          // Zapewnij, że complexity jest w zakresie 1-5
          complexity: Math.max(1, Math.min(5, rec.complexity || 3)),
          // Zapewnij prawidłowy format graczy
          players: rec.players?.match(/^\d+(-\d+)?$/) ? rec.players : "2-4",
          // Zapewnij prawidłowy format czasu trwania
          duration: rec.duration?.match(/^\d+(-\d+)?$/) ? rec.duration : "60",
        }));

        console.log(
          "Zapisywanie przefiltrowanych rekomendacji:",
          JSON.stringify(validatedRecommendations.map((r) => r.title))
        );

        await gamesService.addGamesFromRecommendationsBatch(validatedRecommendations);
        console.log("Pomyślnie zapisano rekomendacje w bazie danych");
      } catch (dbError) {
        // Złap błąd, ale nie zatrzymuj całego procesu
        console.error("Błąd podczas zapisywania rekomendacji w bazie:", dbError);
        console.error("Szczegóły błędu:", JSON.stringify(dbError));

        // Możemy kontynuować i zwrócić rekomendacje użytkownikowi mimo błędu w zapisie do bazy
        console.log("Kontynuowanie pomimo błędu zapisu do bazy danych");
      }

      // Zwróć odpowiedź
      return new Response(JSON.stringify(recommendationResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Błąd podczas generowania rekomendacji:", error);

      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      const errorCode = (error as any).code || "UNKNOWN_ERROR";
      const errorDetails = error instanceof Error ? error.stack || "" : "";

      console.error(`Szczegóły błędu - Kod: ${errorCode}, Wiadomość: ${errorMessage}`);
      if (errorDetails) {
        console.error("Stack trace:", errorDetails);
      }

      return new Response(
        JSON.stringify({
          error: "Nie udało się wygenerować rekomendacji",
          message: errorMessage,
          code: errorCode,
          details: errorDetails,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Błąd podczas przetwarzania żądania:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "");

    return new Response(
      JSON.stringify({
        error: "Błąd podczas przetwarzania żądania",
        message: error instanceof Error ? error.message : "Nieznany błąd",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};
