import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "@/db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  // Sprawdź czy to nie jest żądanie wylogowania
  if (context.url.pathname === "/auth/logout") {
    // Najpierw wyczyść kontekst sesji
    context.locals.session = null;
    context.locals.user = null;

    // Wykonaj żądanie wylogowania
    const response = await next();

    // Dodaj nagłówki czyszczące ciasteczka
    if (response.headers.get("content-type")?.includes("application/json")) {
      response.headers.append("Set-Cookie", "sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      response.headers.append("Set-Cookie", "sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    }

    return response;
  }

  // Pobierz sesję z Supabase
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error || !session) {
    context.locals.session = null;
    context.locals.user = null;
  } else {
    // Dodaj informacje o sesji do kontekstu
    context.locals.session = session;
    context.locals.user = session.user;
  }

  // Kontynuuj przetwarzanie żądania
  const response = await next();
  return response;
});
