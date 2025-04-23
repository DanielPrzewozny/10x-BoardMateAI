import type { APIRoute } from 'astro';
import { supabaseClient } from '@/db/supabase.client';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.user.id;

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('UserId', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profil nie istnieje - zwróć pusty profil z domyślnymi wartościami
        return new Response(JSON.stringify({
          UserId: userId,
          name: '',
          email: session.user.email || '',
          preferences: {
            minPlayers: 2,
            maxPlayers: 4,
            preferredDuration: 60,
            preferredTypes: [],
            complexityLevel: 2,
            budget: 200
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Dodaj domyślne preferencje jeśli nie istnieją
    const preferences = profile?.preferences || {
      minPlayers: 2,
      maxPlayers: 4,
      preferredDuration: 60,
      preferredTypes: [],
      complexityLevel: 2,
      budget: 200
    };

    return new Response(JSON.stringify({ ...profile, preferences }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Sprawdź czy profil istnieje
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('UserId', userId)
      .single();

    let profile;
    let error;

    if (!existingProfile) {
      // Jeśli profil nie istnieje, utwórz nowy
      const { data, error: insertError } = await supabaseClient
        .from('profiles')
        .insert([{ ...body, UserId: userId }])
        .select()
        .single();
      
      profile = data;
      error = insertError;
    } else {
      // Jeśli profil istnieje, zaktualizuj go
      const { data, error: updateError } = await supabaseClient
        .from('profiles')
        .update(body)
        .eq('UserId', userId)
        .select()
        .single();
      
      profile = data;
      error = updateError;
    }

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 