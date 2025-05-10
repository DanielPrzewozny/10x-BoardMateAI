import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// W Astro zmienne środowiskowe muszą mieć przedrostek PUBLIC_ aby były dostępne po stronie klienta
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey =
  import.meta.env.PUBLIC_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Y2F1Z2FyZ2F1Z2FyZ2F1Z2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxMzYxNjgsImV4cCI6MjAyODcxMjE2OH0.00000000000000000000000000000000";

// Sprawdzamy czy URL i klucz są dostępne
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check your environment variables.");
}

// Pobierz referencję projektu z URL
const projectRef = supabaseUrl.split(".")[0].split("//")[1];

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "486306e0-9c44-4a00-9161-8cbfda9e8939";
