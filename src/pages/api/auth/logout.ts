import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import { authService } from "@/lib/services/auth.service";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    //const { error } = await supabaseClient.auth.signOut();
    await authService.signOut();

    return new Response(
      JSON.stringify({
        success: true,
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
        error: "Wystąpił błąd podczas wylogowywania",
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
