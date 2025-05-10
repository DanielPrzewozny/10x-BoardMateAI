import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import type { BoardGameListDTO, PaginationDTO } from "@/types";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log("GET /api/board-games - Początek");

    // Pobierz parametry zapytania
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "9"); // domyślnie 9 gier (3x3 siatka)
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    console.log(`GET /api/board-games - Parametry: page=${page}, perPage=${perPage}`);

    // Pobieranie całkowitej liczby gier
    const { count, error: countError } = await supabaseClient
      .from("board_games")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Błąd podczas liczenia gier:", countError);
      return new Response(JSON.stringify({ error: "Błąd serwera" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobieranie gier z paginacją
    const { data, error } = await supabaseClient
      .from("board_games")
      .select("*")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Błąd podczas pobierania gier:", error);
      return new Response(JSON.stringify({ error: "Błąd serwera" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Przygotuj odpowiedź z informacjami o paginacji
    const response: BoardGameListDTO = {
      games: data || [],
      pagination: {
        total: count || 0,
        page,
        limit: perPage,
      },
    };

    console.log(`GET /api/board-games - Sukces: znaleziono ${data?.length || 0} gier z ${count || 0} łącznie`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Nieoczekiwany błąd:", error);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
