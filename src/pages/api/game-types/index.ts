import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Pobieranie typów gier
    const { data, error } = await supabaseClient
      .from("game_types")
      .select("id, type")
      .order("type", { ascending: true });

    if (error) {
      console.error("Błąd podczas pobierania typów gier:", error);
      return new Response(JSON.stringify({ error: "Błąd serwera" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Zwrócenie danych
    return new Response(JSON.stringify({ types: data }), {
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
