import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// W Astro zmienne środowiskowe muszą mieć przedrostek PUBLIC_ aby były dostępne po stronie klienta
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey =
  import.meta.env.PUBLIC_SUPABASE_KEY;

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

export const DEFAULT_USER_ID = "";
