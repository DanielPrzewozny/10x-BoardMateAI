import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import { z } from 'zod';

export const preferencesSchema = z.object({
  preferred_types: z.array(z.string().uuid())
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

export class PreferencesService {
  constructor(private readonly db: SupabaseClient = supabaseClient) {}

  async getPreferences(userId: string) {
    const { data, error } = await this.db
      .from('profiles')
      .select('preferred_types')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Błąd podczas pobierania preferencji: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nie znaleziono preferencji');
    }

    return data;
  }

  async updatePreferences(userId: string, preferences: PreferencesInput) {
    // Sprawdzenie czy wszystkie typy gier istnieją
    if (preferences.preferred_types.length > 0) {
      const { count, error } = await this.db
        .from('game_types')
        .select('*', { count: 'exact', head: true })
        .in('id', preferences.preferred_types);

      if (error) {
        throw new Error(`Błąd podczas weryfikacji typów gier: ${error.message}`);
      }

      if (!count || count !== preferences.preferred_types.length) {
        throw new Error('Niektóre z podanych typów gier nie istnieją');
      }
    }

    const { data, error } = await this.db
      .from('profiles')
      .update({
        preferred_types: preferences.preferred_types,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('preferred_types')
      .single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji preferencji: ${error.message}`);
    }

    return data;
  }
} 