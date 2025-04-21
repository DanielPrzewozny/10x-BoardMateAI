import type { APIRoute } from 'astro';
import { FavoritesService, favoriteGameSchema, paginationSchema } from '@/lib/services/favorites.service';
import { handleError } from '@/lib/utils/api';
import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import type { User } from '@supabase/supabase-js';

interface Locals {
  supabase: SupabaseClient;
  user: User | null;
}

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    //const { user } = locals;
    
    //if (!user) {
      //return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        //status: 401,
        //headers: { 'Content-Type': 'application/json' }
      //});
    //}

    // Pobierz parametry z URL
    const params = Object.fromEntries(url.searchParams);
    const parseResult = paginationSchema.safeParse(params);
    
    if (!parseResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Nieprawidłowe parametry paginacji',
        details: parseResult.error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const favoritesService = new FavoritesService(locals.supabase);
    const result = await favoritesService.getFavorites(DEFAULT_USER_ID, parseResult.data);

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  } catch (error) {
    return handleError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user } = locals;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const validatedBody = favoriteGameSchema.parse(body);

    const favoritesService = new FavoritesService(locals.supabase);
    const result = await favoritesService.addFavorite(user.id, validatedBody);

    return new Response(JSON.stringify(result), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleError(error);
  }
}; 