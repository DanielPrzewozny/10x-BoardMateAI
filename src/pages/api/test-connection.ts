import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Spróbuj wykonać proste zapytanie, aby sprawdzić połączenie
    const { data, error } = await supabaseClient.from("profiles").select("count(*)").limit(1);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Połączenie z Supabase działa poprawnie",
        data,
        supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Nieznany błąd",
        supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
