import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFormValidation } from "../hooks/useFormValidation";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { validate, errors } = useFormValidation<ResetPasswordFormData>(resetPasswordSchema);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validationResult = validate(data);
    if (!validationResult.success) {
      return;
    }

    // Tutaj będzie logika resetowania hasła
    setError(null);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <Alert>
          <AlertDescription>Twoje hasło zostało pomyślnie zmienione.</AlertDescription>
        </Alert>
        <a href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800">
          Przejdź do strony logowania
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="password">Nowe hasło</Label>
        <Input id="password" name="password" type="password" aria-describedby="password-error" />
        {errors.password && (
          <p className="text-sm text-red-500" id="password-error">
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" aria-describedby="confirm-password-error" />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500" id="confirm-password-error">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full">
        Zmień hasło
      </Button>

      <p className="text-center text-sm text-gray-600">
        <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
          Wróć do strony logowania
        </a>
      </p>
    </form>
  );
}
