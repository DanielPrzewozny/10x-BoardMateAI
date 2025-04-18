import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormValidation } from '../hooks/useFormValidation';

const forgotPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy format adresu email')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { validate, errors } = useFormValidation<ForgotPasswordFormData>(forgotPasswordSchema);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string
    };

    const validationResult = validate(data);
    if (!validationResult.success) {
      return;
    }

    // Tutaj będzie logika wysyłania linku resetującego hasło
    setError(null);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <Alert>
          <AlertDescription>
            Link do resetowania hasła został wysłany na podany adres email.
            Sprawdź swoją skrzynkę odbiorczą.
          </AlertDescription>
        </Alert>
        <a
          href="/auth/login"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Wróć do strony logowania
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="twoj@email.com"
          aria-describedby="email-error"
        />
        {errors.email && (
          <p className="text-sm text-red-500" id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full">
        Wyślij link resetujący
      </Button>

      <p className="text-center text-sm text-gray-600">
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-800"
        >
          Wróć do strony logowania
        </a>
      </p>
    </form>
  );
} 