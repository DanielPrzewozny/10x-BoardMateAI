import * as crypto from 'crypto';
import type { GameDescriptionCommand, GameRecommendation, GameRecommendationsResponseDto, RecommendationErrorLogDto } from '../types';
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '../db/supabase.client';
import { z } from 'zod';
import { OpenRouterService } from './openrouter.service';
import type { ResponseFormat } from './openrouter.types';

const errorLogSchema = z.object({
  error_code: z.string().max(50),
  error_message: z.string().max(1000),
  model: z.string().max(50),
  description_hash: z.string().length(64), // SHA-256 hash
  description_length: z.number().int().positive(),
  user_id: z.string().max(50)
});

type ErrorLogInput = z.infer<typeof errorLogSchema>;

export class RecommendationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RecommendationError';
  }
}

export class RecommendationService {
  private openRouterService: OpenRouterService;
  private defaultModelName: string = "gpt-4o-mini";
  private debugMode: boolean = true; // Włączamy tryb debugowania

  constructor(
    private readonly db: SupabaseClient = supabaseClient,
    apiKey?: string
  ) {
    // Pobierz klucz API z zmiennych środowiskowych, jeśli nie został podany
    const openRouterApiKey = apiKey || import.meta.env.PUBLIC_OPENROUTER_API_KEY;
    
    if (this.debugMode) {
      console.log("Inicjalizacja RecommendationService z kluczem OpenRouter:", 
        openRouterApiKey ? "Klucz dostępny" : "Brak klucza");
    }
    
    if (!openRouterApiKey) {
      throw new RecommendationError(
        "Brak klucza API dla OpenRouter",
        "OPENROUTER_API_KEY_MISSING"
      );
    }
    
    this.openRouterService = new OpenRouterService(
      openRouterApiKey as string,
      this.defaultModelName,
      "Jesteś ekspertem od gier planszowych. Twoim zadaniem jest rekomendowanie gier planszowych na podstawie opisu preferencji użytkownika."
    );
  }

  private async logError(error: RecommendationError, description: string): Promise<void> {
    try {
      const errorLog: ErrorLogInput = {
        error_code: error.code,
        error_message: error.message,
        model: this.openRouterService.modelName,
        description_hash: crypto.createHash('sha256').update(description).digest('hex'),
        description_length: description.length,
        user_id: DEFAULT_USER_ID
      };

      // Walidacja danych przed zapisem
      const parseResult = errorLogSchema.safeParse(errorLog);
      if (!parseResult.success) {
        console.error('Błąd walidacji logu:', parseResult.error);
        return;
      }

      const { error: dbError } = await this.db
        .from('recommendation_error_logs')
        .insert(parseResult.data as RecommendationErrorLogDto);

      if (dbError) {
        console.error('Błąd podczas zapisywania logu błędu:', dbError);
      }
    } catch (error) {
      console.error('Wyjątek podczas zapisywania logu błędu:', error);
    }
  }

  private validateDescription(command: GameDescriptionCommand): void {
    if (!command.description) {
      throw new RecommendationError(
        'Opis jest wymagany',
        'INVALID_DESCRIPTION'
      );
    }

    if (command.description.length < 200) {
      throw new RecommendationError(
        'Opis jest za krótki (minimum 200 znaków)',
        'DESCRIPTION_TOO_SHORT',
        { length: command.description.length }
      );
    }

    if (command.description.length > 10000) {
      throw new RecommendationError(
        'Opis jest za długi (maksimum 10000 znaków)',
        'DESCRIPTION_TOO_LONG',
        { length: command.description.length }
      );
    }

    if (command.players && (command.players < 1 || command.players > 12)) {
      throw new RecommendationError(
        'Nieprawidłowa liczba graczy (zakres 1-12)',
        'INVALID_PLAYERS_COUNT',
        { players: command.players }
      );
    }

    if (command.duration && (command.duration < 15 || command.duration > 240)) {
      throw new RecommendationError(
        'Nieprawidłowy czas gry (zakres 15-240 minut)',
        'INVALID_DURATION',
        { duration: command.duration }
      );
    }

    if (command.complexity && (command.complexity < 1 || command.complexity > 5)) {
      throw new RecommendationError(
        'Nieprawidłowy poziom złożoności (zakres 1-5)',
        'INVALID_COMPLEXITY',
        { complexity: command.complexity }
      );
    }
  }

  private generatePrompt(command: GameDescriptionCommand): string {
    let prompt = `Potrzebuję trzech rekomendacji gier planszowych na podstawie następujących preferencji:\n\n`;
    prompt += `Opis preferencji: ${command.description}\n\n`;
    
    if (command.players) {
      prompt += `Liczba graczy: ${command.players}\n`;
    }
    
    if (command.duration) {
      prompt += `Czas gry: ${command.duration} minut\n`;
    }
    
    if (command.complexity) {
      prompt += `Poziom złożoności: ${command.complexity}/5\n`;
    }
    
    if (command.types && command.types.length > 0) {
      prompt += `Preferowane typy gier: ${command.types.join(", ")}\n`;
    }
    
    prompt += `\nZapewnij odpowiedź w formacie JSON z trzema różnymi rekomendacjami w tablicy. Każda rekomendacja powinna zawierać:
1. title - tytuł gry (string)
2. players - liczba graczy (string w formacie "1-4" lub podobnym)
3. duration - czas gry w minutach (string, np. "30-60")
4. types - lista typów gry (tablica stringów)
5. complexity - poziom złożoności w skali 1-5 (liczba całkowita)
6. description - szczegółowy opis rekomendacji (string)
7. imageUrl - pozostaw jako pusty string (będzie wypełniony później)

Zwróć poprawny JSON zgodny z tym formatem, bez wyjaśnień czy dodatkowego tekstu.`;
    
    return prompt;
  }

  private getResponseFormat(): ResponseFormat {
    // Format JSON Schema dla listy rekomendacji
    return {
      type: "json_schema",
      json_schema: {
        name: "gameRecommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  players: { type: "string" },
                  duration: { type: "string" },
                  types: { 
                    type: "array", 
                    items: { type: "string" } 
                  },
                  complexity: { type: "integer" },
                  description: { type: "string" },
                  imageUrl: { type: "string" }
                },
                required: ["title", "players", "duration", "types", "complexity", "description", "imageUrl"],
                additionalProperties: false
              }
            }
          },
          required: ["recommendations"],
          additionalProperties: false
        }
      }
    };
  }

  private async parseAIResponse(jsonResponse: string): Promise<GameRecommendation[]> {
    try {
      if (this.debugMode) {
        console.log("Odpowiedź z OpenRouter:", jsonResponse);
      }
      
      // Próba parsowania JSON
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonResponse);
      } catch (e) {
        // Jeśli odpowiedź nie jest poprawnym JSON, spróbuj wyciągnąć JSON z tekstu
        const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Nie można znaleźć poprawnego formatu JSON w odpowiedzi");
        }
      }
      
      // Walidacja odpowiedzi
      if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations) || parsedResponse.recommendations.length === 0) {
        throw new Error("Odpowiedź nie zawiera listy rekomendacji");
      }
      
      return parsedResponse.recommendations.map((recommendation: any) => ({
        title: String(recommendation.title),
        players: String(recommendation.players),
        duration: String(recommendation.duration),
        types: Array.isArray(recommendation.types) ? recommendation.types : [recommendation.types],
        complexity: Number(recommendation.complexity),
        description: String(recommendation.description),
        imageUrl: String(recommendation.imageUrl || "")
      }));
    } catch (error) {
      if (this.debugMode) {
        console.error("Błąd parsowania odpowiedzi AI:", error, "Oryginalna odpowiedź:", jsonResponse);
      }
      
      throw new RecommendationError(
        "Nie udało się przetworzyć odpowiedzi z modelu AI: " + (error instanceof Error ? error.message : String(error)),
        "AI_RESPONSE_PARSE_ERROR",
        { response: jsonResponse }
      );
    }
  }

  async getRecommendations(command: GameDescriptionCommand): Promise<GameRecommendationsResponseDto> {
    try {
      this.validateDescription(command);
      
      const prompt = this.generatePrompt(command);
      
      if (this.debugMode) {
        console.log("Prompt do OpenRouter:", prompt);
      }
      
      const responseFormat = this.getResponseFormat();
      
      // Parametry dla modelu
      const modelParams = {
        temperature: 0.7,
        max_tokens: 1500
      };
      
      // Tworzymy wiadomość w formacie wymaganym przez OpenRouter
      const messages = [{ role: 'user' as const, content: prompt }];
      
      // Wywołanie OpenRouter API
      const response = await this.openRouterService.generateResponse(
        messages,
        responseFormat,
        modelParams
      );
      
      // Parsowanie odpowiedzi
      const recommendations = await this.parseAIResponse(response);
      
      return {
        recommendations: recommendations
      };

    } catch (error) {
      if (error instanceof RecommendationError) {
        await this.logError(error, command.description);
        throw error;
      }

      // W trybie debugowania, wyświetl więcej szczegółów
      if (this.debugMode) {
        console.error("Szczegóły błędu:", error);
      }

      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      const unknownError = new RecommendationError(
        `Wystąpił nieoczekiwany błąd: ${errorMessage}`,
        "UNKNOWN_ERROR"
      );
      
      await this.logError(unknownError, command.description);
      throw unknownError;
    }
  }
} 