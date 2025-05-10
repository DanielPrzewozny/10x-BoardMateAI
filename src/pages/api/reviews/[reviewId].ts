import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { reviewId } = params;

    if (!reviewId) {
      return new Response(JSON.stringify({ message: "Brak identyfikatora recenzji" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdź czy użytkownik jest zalogowany
    const { user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ message: "Musisz być zalogowany, aby usunąć recenzję" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdź czy recenzja istnieje i czy należy do zalogowanego użytkownika
    const { data: review, error: reviewError } = await supabaseClient
      .from("reviews")
      .select("id, user_id, game_id")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return new Response(JSON.stringify({ message: "Nie znaleziono recenzji" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdź czy zalogowany użytkownik jest autorem recenzji
    if (review.user_id !== user.id) {
      return new Response(JSON.stringify({ message: "Nie masz uprawnień do usunięcia tej recenzji" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Usuń również ocenę użytkownika dla tej gry (jeśli istnieje)
    if (review.game_id) {
      const { data: rating } = await supabaseClient
        .from("ratings")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", review.game_id)
        .single();

      if (rating) {
        const { error: ratingDeleteError } = await supabaseClient.from("ratings").delete().eq("id", rating.id);

        if (ratingDeleteError) {
          console.error("Błąd podczas usuwania oceny:", ratingDeleteError);
        }
      }
    }

    // Usuń recenzję
    const { error: deleteError } = await supabaseClient.from("reviews").delete().eq("id", reviewId);

    if (deleteError) {
      return new Response(JSON.stringify({ message: "Wystąpił błąd podczas usuwania recenzji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Recenzja została pomyślnie usunięta" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Nieobsłużony błąd podczas usuwania recenzji:", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
