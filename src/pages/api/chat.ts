import type { APIRoute } from 'astro';
import { z } from 'zod';
import { OpenRouterService } from '../../lib/openrouter.service';
import type { ResponseFormat } from '../../lib/openrouter.types';

// Schemat walidacji dla żądania
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Wiadomość jest wymagana'),
  modelName: z.string().optional(),
  responseFormat: z.object({
    type: z.literal('json_schema'),
    json_schema: z.object({
      name: z.string(),
      strict: z.boolean(),
      schema: z.record(z.any())
    })
  }).optional()
});

// Oznaczamy, że endpoint nie jest wstępnie renderowany
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Sprawdzamy czy klucz API jest dostępny
    const apiKey = import.meta.env.PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Brak klucza API OpenRouter' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parsujemy ciało żądania
    const body = await request.json();

    // Walidujemy dane wejściowe
    const result = chatRequestSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Nieprawidłowe dane wejściowe', details: result.error.format() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, modelName, responseFormat } = result.data;

    // Inicjalizujemy serwis OpenRouter
    const openRouterService = new OpenRouterService(
      apiKey as string,
      modelName,
      'Jesteś asystentem AI, który pomaga użytkownikom znaleźć informacje o grach planszowych.'
    );

    // Generujemy odpowiedź
    const response = await openRouterService.generateResponse(
      message,
      responseFormat as ResponseFormat
    );

    // Zwracamy odpowiedź jako JSON
    return new Response(
      JSON.stringify({ response }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Błąd podczas przetwarzania żądania czatu:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Wystąpił błąd podczas przetwarzania żądania',
        message: error instanceof Error ? error.message : 'Nieznany błąd'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 