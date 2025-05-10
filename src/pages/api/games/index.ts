import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import type { BoardGameListDTO, PaginationDTO } from "@/types";

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log("GET /api/games - Początek");

    // Pobierz parametry zapytania
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "9");
    const sortBy = url.searchParams.get("sortBy") || "title";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";
    const searchQuery = url.searchParams.get("search") || "";

    // Walidacja parametrów
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 50); // Limit max 50 gier na raz
    const offset = (validPage - 1) * validLimit;

    console.log(
      `GET /api/games - Parametry: page=${validPage}, limit=${validLimit}, sort=${sortBy}:${sortOrder}, search=${searchQuery}`
    );

    // Przygotuj zapytanie bazowe
    let query = supabaseClient.from("board_games").select("*", { count: "exact" });

    // Dodaj wyszukiwanie, jeśli podano
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    // Pobierz tylko aktywne gry
    query = query.eq("is_archived", false);

    // Dodaj sortowanie
    if (["title", "complexity", "min_players", "max_players", "duration"].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
    } else {
      query = query.order("title", { ascending: true });
    }

    // Dodaj paginację
    query = query.range(offset, offset + validLimit - 1);

    // Wykonaj zapytanie
    const { data: games, count, error } = await query;

    if (error) {
      console.error("GET /api/games - Błąd bazy danych:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Przygotuj dane paginacji
    const totalGames = count || 0;
    const totalPages = Math.ceil(totalGames / validLimit);

    const pagination: PaginationDTO = {
      page: validPage,
      limit: validLimit,
      total: totalGames,
    };

    // Przygotuj odpowiedź
    const response: BoardGameListDTO = {
      games: games || [],
      pagination,
    };

    console.log(`GET /api/games - Sukces: znaleziono ${games?.length || 0} gier z ${totalGames} łącznie`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/games - Wyjątek:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
