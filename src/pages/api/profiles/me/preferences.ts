import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log("GET /api/profiles/me/preferences - Początek");
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      console.log("GET /api/profiles/me/preferences - Brak sesji");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    console.log(`GET /api/profiles/me/preferences - User ID: ${userId}`);

    // Sprawdź czy profil istnieje
    const { data: profile } = await supabaseClient.from("profiles").select("*").eq("user_id", userId).single();

    if (!profile) {
      console.log("GET /api/profiles/me/preferences - Profil nie znaleziony");
      return new Response(
        JSON.stringify({
          error: "Profile not found",
          preferences: null,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`GET /api/profiles/me/preferences - Znaleziono profil: ${profile.id}`);

    // Pobierz preferencje użytkownika
    const { data: preferences } = await supabaseClient
      .from("preferences")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();

    // Jeśli preferencje nie istnieją, zwróć domyślne wartości
    if (!preferences) {
      console.log("GET /api/profiles/me/preferences - Brak preferencji, zwracam domyślne");
      const defaultPreferences = {
        min_players: 1,
        max_players: 10,
        preferred_duration: 60,
        preferred_types: [],
        complexity_level: 1,
        budget: null,
      };
      console.log("Domyślne preferencje:", defaultPreferences);

      return new Response(
        JSON.stringify({
          preferences: defaultPreferences,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("GET /api/profiles/me/preferences - Znalezione preferencje:", preferences);
    return new Response(JSON.stringify({ preferences }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/profiles/me/preferences - Błąd:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    console.log("PUT /api/profiles/me/preferences - Początek");
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      console.log("PUT /api/profiles/me/preferences - Brak sesji");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    console.log(`PUT /api/profiles/me/preferences - User ID: ${userId}`);

    const preferencesData = await request.json();
    console.log("PUT /api/profiles/me/preferences - Otrzymane dane:", preferencesData);

    // Sprawdź czy profil istnieje
    const { data: existingProfile } = await supabaseClient.from("profiles").select("*").eq("user_id", userId).single();

    if (!existingProfile) {
      console.log("PUT /api/profiles/me/preferences - Profil nie znaleziony");
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`PUT /api/profiles/me/preferences - Znaleziono profil: ${existingProfile.id}`);

    // Sprawdź czy preferencje istnieją
    const { data: existingPreferences } = await supabaseClient
      .from("preferences")
      .select("*")
      .eq("profile_id", existingProfile.id)
      .maybeSingle();

    let preferences;
    let error;

    if (existingPreferences) {
      console.log("PUT /api/profiles/me/preferences - Aktualizacja istniejących preferencji");

      const updateData = {
        min_players: preferencesData.min_players,
        max_players: preferencesData.max_players,
        preferred_duration: preferencesData.preferred_duration,
        preferred_types: preferencesData.preferred_types || [],
        complexity_level: preferencesData.complexity_level,
        budget: preferencesData.budget,
        updated_at: new Date().toISOString(),
      };

      console.log("Dane do aktualizacji:", updateData);

      const { data, error: updateError } = await supabaseClient
        .from("preferences")
        .update(updateData)
        .eq("profile_id", existingProfile.id)
        .select()
        .single();

      preferences = data;
      error = updateError;
    } else {
      console.log("PUT /api/profiles/me/preferences - Tworzenie nowych preferencji");

      const insertData = {
        profile_id: existingProfile.id,
        user_id: userId,
        min_players: preferencesData.min_players || 1,
        max_players: preferencesData.max_players || 10,
        preferred_duration: preferencesData.preferred_duration || 60,
        preferred_types: preferencesData.preferred_types || [],
        complexity_level: preferencesData.complexity_level || 1,
        budget: preferencesData.budget || null,
      };

      console.log("Dane do wstawienia:", insertData);

      const { data, error: insertError } = await supabaseClient
        .from("preferences")
        .insert([insertData])
        .select()
        .single();

      preferences = data;
      error = insertError;
    }

    if (error) {
      console.error("PUT /api/profiles/me/preferences - Błąd:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("PUT /api/profiles/me/preferences - Sukces:", { preferences });
    return new Response(
      JSON.stringify({
        profile: existingProfile,
        preferences,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PUT /api/profiles/me/preferences - Wyjątek:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
