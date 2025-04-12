import * as crypto from 'crypto';
import type { GameDescriptionCommand, GameDescriptionResponseDto, RecommendationErrorLogDto } from '../types';
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '../db/supabase.client';
import { z } from 'zod';

/**
 * TODO: Przyszłe ulepszenia:
 * 1. Dodać konfigurację modelu AI (nazwa, parametry) przez zmienne środowiskowe
 * 2. Dodać więcej mocków dla różnych scenariuszy (różne typy gier, liczby graczy itp.)
 * 3. Dodać cache dla częstych zapytań
 * 4. Zaimplementować rate limiting dla użytkowników
 * 5. Dodać walidację typów gier (enum zamiast dowolnego stringa)
 * 6. Rozważyć asynchroniczne przetwarzanie długich zapytań
 */

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
  constructor(private readonly db: SupabaseClient = supabaseClient) {}

  private async logError(error: RecommendationError, description: string): Promise<void> {
    const errorLog: ErrorLogInput = {
      error_code: error.code,
      error_message: error.message,
      model: 'gpt-4',
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

    if (command.players && (command.players < 1 || command.players > 5)) {
      throw new RecommendationError(
        'Nieprawidłowa liczba graczy (zakres 1-5)',
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

  async getRecommendations(command: GameDescriptionCommand): Promise<GameDescriptionResponseDto> {
    try {
      this.validateDescription(command);

      // Mock implementacji AI
      await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja opóźnienia
      
      const mockRecommendations: GameDescriptionResponseDto = {
        players: command.players || 4,
        duration: command.duration || 60,
        types: command.types || ['strategy', 'family', 'card'],
        complexity: command.complexity || 3,
        description: `Na podstawie Twojego opisu, proponuję grę planszową, która:
- Jest przeznaczona dla ${command.players || '2-4'} graczy
- Trwa około ${command.duration || '60'} minut
- Ma złożoność ${command.complexity || '3'}/5
- Łączy elementy: ${(command.types || ['strategy', 'family', 'card']).join(', ')}

Opis gry zawiera ${command.description.length} znaków.`
      };

      return mockRecommendations;

    } catch (error) {
      if (error instanceof RecommendationError) {
        await this.logError(error, command.description);
        throw error;
      }

      const unknownError = new RecommendationError(
        'Wystąpił nieoczekiwany błąd',
        'UNKNOWN_ERROR'
      );
      await this.logError(unknownError, command.description);
      throw unknownError;
    }
  }
} 