import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormValidation } from '../hooks/useFormValidation';
import { supabaseClient } from '@/db/supabase.client';

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy format adresu email'),
  password: z.string()
    .min(8, 'Hasło musi mieć minimum 8 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać przynajmniej jedną wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać przynajmniej jedną cyfrę'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { validate, errors } = useFormValidation<RegisterFormData>(registerSchema);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string
    };

    const validationResult = validate(data);
    if (!validationResult.success) {
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Przekieruj do strony potwierdzenia
      window.location.href = '/auth/verify-email';
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500" id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          aria-describedby="password-error"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500" id="password-error">
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          aria-describedby="confirm-password-error"
          disabled={isLoading}
        />
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Masz już konto?{' '}
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Zaloguj się
        </a>
      </p>
    </form>
  );
} 