import { ZodError } from "zod";

export function handleError(error: unknown): Response {
  if (error instanceof ZodError) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        details: error.errors,
      }),
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Mapowanie znanych błędów na odpowiednie kody HTTP
    if (error.message === "Nie znaleziono gry") {
      return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    }
    if (error.message === "Gra jest już w ulubionych") {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    if (error.message === "Nie można dodać zarchiwizowanej gry do ulubionych") {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Logowanie nieoczekiwanych błędów
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }

  return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
}
