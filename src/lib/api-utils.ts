interface ApiError {
  message: string;
  status?: number;
}

export function handleError(error: unknown): Response {
  const status = (error as ApiError).status || 500;
  const message = error instanceof Error ? error.message : (error as ApiError).message || "Wystąpił nieoczekiwany błąd";

  console.error("API Error:", error);

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
