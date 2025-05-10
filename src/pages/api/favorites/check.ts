import type { APIRoute } from "astro";
import { handleError } from "@/lib/utils/api";
import { supabaseClient } from "@/db/supabase.client";

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const { user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const gameId = url.searchParams.get("gameId");

    if (!gameId) {
      return new Response(JSON.stringify({ error: "Brak identyfikatora gry" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabaseClient
      .from("favorite_games")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", gameId)
      .single();

    return new Response(
      JSON.stringify({
        isFavorite: !!data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return handleError(error);
  }
};
