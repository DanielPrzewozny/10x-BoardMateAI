import type { APIRoute } from "astro";
import { FavoritesService } from "@/lib/services/favorites.service";
import { handleError } from "@/lib/utils/api";

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { gameId } = params;

  if (!gameId) {
    return new Response(JSON.stringify({ error: "Brak identyfikatora gry" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const favoritesService = new FavoritesService(locals.supabase);
    await favoritesService.removeFavorite(user.id, gameId);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
};
