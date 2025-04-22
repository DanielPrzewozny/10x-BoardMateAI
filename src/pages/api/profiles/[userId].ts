import type { APIRoute } from 'astro';
import { supabaseClient } from '@/db/supabase.client';

export const GET: APIRoute = async ({ params, request }) => {
  const { userId } = params;

  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Dodaj domyślne preferencje jeśli nie istnieją
    const preferences = profile.preferences || {
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

export const PATCH: APIRoute = async ({ params, request }) => {
  const { userId } = params;
  const body = await request.json();

  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .update(body)
      .eq('id', userId)
      .select()
      .single();

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