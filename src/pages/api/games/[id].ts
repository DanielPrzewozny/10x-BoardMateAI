import type { APIRoute } from 'astro';
import { GamesService } from '@/lib/services/games.service';
import { handleError } from '@/lib/utils/api';

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID gry jest wymagane' }), { status: 400 });
    }

    const gamesService = new GamesService();
    const result = await gamesService.getGameById(id);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}; 