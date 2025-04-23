import type { APIRoute } from 'astro';
import { supabaseClient } from '@/db/supabase.client';

export const PUT: APIRoute = async ({ request }) => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.user.id;
    const preferences = await request.json();

    // Sprawdź czy profil istnieje
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('UserId', userId)
      .single();

    let profile;
    let error;

    if (!existingProfile) {
      // Jeśli profil nie istnieje, utwórz nowy z preferencjami
      const { data, error: insertError } = await supabaseClient
        .from('profiles')
        .insert([{ UserId: userId, preferences }])
        .select()
        .single();
      
      profile = data;
      error = insertError;
    } else {
      // Jeśli profil istnieje, zaktualizuj preferencje
      const { data, error: updateError } = await supabaseClient
        .from('profiles')
        .update({ preferences })
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