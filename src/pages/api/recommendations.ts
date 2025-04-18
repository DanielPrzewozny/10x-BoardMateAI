import type { APIRoute } from 'astro';
import type { GameDescriptionCommand } from '../../types';
import { RecommendationService } from '../../lib/recommendation.service';
import { supabaseClient } from '../../db/supabase.client';
import { z } from 'zod';

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
  console.log('POST /api/recommendations został wywołany');

  try {
    const requestData = await request.json();
    
    // Walidacja danych wejściowych
    const validationResult = gameDescriptionSchema.safeParse(requestData);
    
    if (!validationResult.success) {
      console.error('Błędne dane wejściowe:', validationResult.error);
      return new Response(
        JSON.stringify({
          error: 'Nieprawidłowe dane wejściowe',
          details: validationResult.error.format()
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Inicjalizacja serwisu rekomendacji
    const recommendationService = new RecommendationService(supabaseClient);
    
    try {
      // W trybie testowym użyj mocków
      const useTestMode = import.meta.env.PUBLIC_USE_TEST_MODE === 'true';
      
      // Konwersja danych do wymaganego formatu
      const gameDescription: GameDescriptionCommand = {
        description: validationResult.data.description,
        players: validationResult.data.players || 4, // Domyślna wartość
        duration: validationResult.data.duration || 60, // Domyślna wartość
        complexity: validationResult.data.complexity || 3, // Domyślna wartość
        types: validationResult.data.types || ['strategy'] // Domyślna wartość
      };
      
      // Pozyskaj rekomendacje
      const recommendationResponse = await recommendationService.getRecommendations(gameDescription);
      
      // Zwróć odpowiedź
      return new Response(
        JSON.stringify(recommendationResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Błąd podczas generowania rekomendacji:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      const errorCode = (error as any).code || 'UNKNOWN_ERROR';
      
      return new Response(
        JSON.stringify({
          error: 'Nie udało się wygenerować rekomendacji',
          message: errorMessage,
          code: errorCode
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Błąd podczas przetwarzania żądania:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Błąd podczas przetwarzania żądania',
        message: error instanceof Error ? error.message : 'Nieznany błąd'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 