import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const GET: APIRoute = async ({ request }) => {
  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;

    // Szukamy profilu po user_id
    const { data: profile, error } = await supabaseClient.from("profiles").select("*").eq("user_id", userId).single();

    if (error) {
      if (error.code === "PGRST116") {
        // Profil nie istnieje - zwróć pusty profil z podstawowymi wartościami
        return new Response(
          JSON.stringify({
            // id nie jest ustawiane - zostanie wygenerowane automatycznie przy zapisie
            user_id: userId,
            first_name: "",
            last_name: "",
            email: session.user.email || "",
            // Usunięto preferencje, będą dostępne w osobnym endpoincie
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Usunięto dodawanie domyślnych preferencji
    // Preferencje będą dostępne przez dedykowany endpoint

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      console.error("PATCH /api/profiles/me - brak sesji użytkownika");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    console.log("PATCH /api/profiles/me - ID użytkownika:", userId);

    const body = await request.json();
    console.log("PATCH /api/profiles/me - otrzymane dane:", body);

    // Usuń właściwość preferences z body, jeśli istnieje
    // Preferencje będą obsługiwane przez osobny endpoint
    const { preferences, id, ...profileData } = body; // Usuwamy id z body, aby nie próbować go ustawić
    console.log("PATCH /api/profiles/me - dane profilu po filtracji:", profileData);

    // Sprawdź czy profil istnieje
    const { data: existingProfile, error: checkError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (checkError) {
      console.log("PATCH /api/profiles/me - błąd sprawdzania profilu:", checkError);
    } else {
      console.log("PATCH /api/profiles/me - istniejący profil:", existingProfile);
    }

    let profile;
    let error;

    if (!existingProfile) {
      console.log("PATCH /api/profiles/me - tworzenie nowego profilu");
      // Jeśli profil nie istnieje, utwórz nowy bez ustawiania id
      const insertData = {
        ...profileData,
        // id jest generowane automatycznie przez bazę danych
        user_id: userId, // Ustawiamy user_id na userId (auth.uid)
      };
      console.log("PATCH /api/profiles/me - dane do wstawienia:", insertData);

      const { data, error: insertError } = await supabaseClient.from("profiles").insert([insertData]).select().single();

      profile = data;
      error = insertError;

      if (insertError) {
        console.error("PATCH /api/profiles/me - błąd wstawiania:", insertError);
      } else {
        console.log("PATCH /api/profiles/me - wstawiony profil:", data);
      }
    } else {
      console.log("PATCH /api/profiles/me - aktualizacja istniejącego profilu");
      // Upewniamy się, że user_id pozostaje niezmienione
      const updateData = {
        ...profileData,
        user_id: userId,
      };
      console.log("PATCH /api/profiles/me - dane do aktualizacji:", updateData);

      // Jeśli profil istnieje, zaktualizuj go
      const { data, error: updateError } = await supabaseClient
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId) // Filtrujemy po user_id zamiast id
        .select()
        .single();

      profile = data;
      error = updateError;

      if (updateError) {
        console.error("PATCH /api/profiles/me - błąd aktualizacji:", updateError);
      } else {
        console.log("PATCH /api/profiles/me - zaktualizowany profil:", data);
      }
    }

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PATCH /api/profiles/me - nieobsłużony błąd:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
