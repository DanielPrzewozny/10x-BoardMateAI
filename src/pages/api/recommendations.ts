import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { GameDescriptionCommand, GameDescriptionResponseDto } from '../../types';
import { RecommendationService, RecommendationError } from '../../lib/recommendation.service';

export const prerender = false;

const gameDescriptionSchema = z.object({
  description: z.string()
    .min(200, 'Opis musi mieć co najmniej 200 znaków')
    .max(10000, 'Opis nie może przekraczać 10000 znaków'),
  players: z.number().int().min(1).max(12).optional(),
  duration: z.number().int().min(15).max(240).optional(),
  types: z.array(z.string()).min(1).max(5).optional(),
  complexity: z.number().int().min(1).max(5).optional()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parsowanie body żądania
    const input = await request.json();

    // Walidacja danych wejściowych
    const parseResult = gameDescriptionSchema.safeParse(input);
    
    if (!parseResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Nieprawidłowe dane wejściowe',
        details: parseResult.error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Wywołanie serwisu rekomendacji
    const recommendationService = new RecommendationService();
    const recommendations = await recommendationService.getRecommendations(
      parseResult.data as GameDescriptionCommand
    );

    return new Response(JSON.stringify(recommendations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (error instanceof RecommendationError) {
      return new Response(JSON.stringify({ 
        error: error.message,
        code: error.code,
        details: error.details
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.error('Błąd podczas przetwarzania żądania:', error);
    return new Response(JSON.stringify({ error: 'Wystąpił błąd wewnętrzny' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 