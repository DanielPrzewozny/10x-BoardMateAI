import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import { z } from "zod";

// Schemat walidacji danych wejściowych
const reviewSchema = z.object({
  gameId: z.string().uuid(),
  reviewText: z.string().min(1, "Recenzja nie może być pusta").max(1000, "Recenzja jest zbyt długa"),
  rating: z.number().int().min(1).max(5),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user } = locals;

    // Sprawdzenie czy użytkownik jest zalogowany
    if (!user) {
      return new Response(JSON.stringify({ message: "Musisz być zalogowany, aby dodać recenzję" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobranie danych z żądania
    const body = await request.json();

    // Walidacja danych
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: "Nieprawidłowe dane recenzji",
          errors: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { gameId, reviewText, rating } = result.data;

    // Sprawdzenie czy gra istnieje
    const { data: game, error: gameError } = await supabaseClient
      .from("board_games")
      .select("id")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return new Response(JSON.stringify({ message: "Nie znaleziono gry" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzenie czy użytkownik już dodał recenzję dla tej gry
    const { data: existingReview } = await supabaseClient
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", gameId)
      .single();

    if (existingReview) {
      return new Response(JSON.stringify({ message: "Już dodałeś recenzję dla tej gry" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Dodanie recenzji
    const { data: review, error: reviewError } = await supabaseClient
      .from("reviews")
      .insert({
        user_id: user.id,
        game_id: gameId,
        review_text: reviewText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reviewError) {
      console.error("Błąd podczas dodawania recenzji:", reviewError);
      return new Response(JSON.stringify({ message: "Wystąpił błąd podczas dodawania recenzji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Dodanie oceny
    const { error: ratingError } = await supabaseClient.from("ratings").insert({
      user_id: user.id,
      game_id: gameId,
      rating_value: rating,
    });

    if (ratingError) {
      console.error("Błąd podczas dodawania oceny:", ratingError);
      // Nie zwracamy błędu, jeśli ocena się nie dodała, ale recenzja tak
    }

    return new Response(
      JSON.stringify({
        message: "Recenzja została dodana pomyślnie",
        data: review,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Nieobsłużony błąd podczas dodawania recenzji:", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
