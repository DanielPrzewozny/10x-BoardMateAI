import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import { z } from 'zod';

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  account_status: z.enum(['active', 'suspended', 'deleted']).optional(),
  preferred_types: z.array(z.string().uuid()).optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export class ProfilesService {
  constructor(private db: SupabaseClient = supabaseClient) {

  }

  async getProfile(userId: string) {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Błąd podczas pobierania profilu: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nie znaleziono profilu');
    }

    return data;
  }

  async updateProfile(userId: string, profile: UpdateProfileInput) {
    // Sprawdzenie czy typy gier istnieją
    if (profile.preferred_types && profile.preferred_types.length > 0) {
      const { count, error } = await this.db
        .from('game_types')
        .select('*', { count: 'exact', head: true })
        .in('id', profile.preferred_types);

      if (error) {
        throw new Error(`Błąd podczas weryfikacji typów gier: ${error.message}`);
      }

      if (!count || count !== profile.preferred_types.length) {
        throw new Error('Niektóre z podanych typów gier nie istnieją');
      }
    }

    const { data, error } = await this.db
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji profilu: ${error.message}`);
    }

    return data;
  }
} 