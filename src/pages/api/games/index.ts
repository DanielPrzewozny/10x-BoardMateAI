import type { APIRoute } from 'astro';
import { GamesService, gameFiltersSchema } from '@/lib/services/games.service';
import { handleError } from '@/lib/utils/api';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const { supabase } = locals;
    const params = Object.fromEntries(url.searchParams);
    const validatedParams = gameFiltersSchema.parse(params);

    const gamesService = new GamesService(supabase);
    const result = await gamesService.getGames(validatedParams);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}; 