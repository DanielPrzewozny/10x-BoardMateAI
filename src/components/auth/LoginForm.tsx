import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { secureStorage } from "@/lib/utils/secureStorage";
import { z } from "zod";
import { useFormValidation } from "../hooks/useFormValidation";
import { authService } from "@/lib/services/auth.service";

// Schema walidacji formularza
const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło powinno mieć co najmniej 6 znaków"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { validate, errors } = useFormValidation<LoginFormData>(loginSchema);

  // Przy montowaniu komponentu wyczyść wszystkie dane sesji
  useEffect(() => {
    async function cleanupSession() {
      try {
        await authService.clearAllStorageData();
        console.log("Wyczyszczono dane sesji przed logowaniem");
      } catch (err) {
        console.error("Błąd podczas czyszczenia sesji:", err);
      }
    }

    cleanupSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validationResult = validate(data);
    if (!validationResult.success) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Rozpoczynam proces logowania...");
      console.log("URL Supabase:", import.meta.env.PUBLIC_SUPABASE_URL);

      // Przed logowaniem wyczyść wszystkie dane z poprzedniej sesji
      await authService.clearAllStorageData();

      // Najpierw spróbuj sprawdzić dostępność API
      try {
        const testResponse = await fetch("/api/test-connection");
        const testResult = await testResponse.json();
        console.log("Test połączenia z Supabase:", testResult);

        if (!testResult.success) {
          throw new Error(`Problem z połączeniem do Supabase: ${testResult.error}`);
        }
      } catch (testError) {
        console.error("Błąd podczas testu połączenia:", testError);
      }

      // Teraz spróbuj się zalogować
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).catch((err) => {
        console.error("Błąd fetch podczas logowania:", err);
        throw new Error(`Błąd połączenia: ${err.message}`);
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      console.log("Logowanie powiodło się, zapisuję sesję...");

      // Zapisz sesję w localStorage
      if (result.session) {
        secureStorage.setItem("sb-access-token", result.session);

        // Czekaj chwilę, aby dane sesji zostały zapisane
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("Sesja została zapisana, przekierowuję...");
      } else {
        console.error("Brak danych sesji w odpowiedzi z serwera");
      }

      // Przekieruj do strony rekomendacji
      window.location.href = "/recommendations";
    } catch (err) {
      console.error("Błąd podczas logowania:", err);
      const errorMessage =
        err instanceof Error
          ? `Wystąpił błąd podczas logowania: ${err.message}`
          : "Wystąpił nieznany błąd podczas logowania. Spróbuj ponownie.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Logowanie</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Hasło
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logowanie...
            </>
          ) : (
            "Zaloguj się"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
          Zapomniałeś hasła?
        </a>
      </div>

      <div className="mt-6 text-center text-sm">
        Nie masz konta?{" "}
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Zarejestruj się
        </a>
      </div>
    </div>
  );
}
