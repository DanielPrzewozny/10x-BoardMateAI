import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import type { GamePreferences } from "@/types";

export const PUT: APIRoute = async ({ params, request }) => {
  const { userId } = params;
  const preferences = (await request.json()) as GamePreferences;

  try {
    const { data: profile, error } = await supabaseClient
      .from("profiles")
      .update({ preferences })
      .eq("id", userId)
      .select()
      .single();

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
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
