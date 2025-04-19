import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormValidation } from '../hooks/useFormValidation';
import { secureStorage } from '@/lib/utils/secureStorage';

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format adresu email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { validate, errors } = useFormValidation<LoginFormData>(loginSchema);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    const validationResult = validate(data);
    if (!validationResult.success) {
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!result.success) {
        setError(result.error);
        return;
      }

      // Zapisz token w localStorage
      if (result.session?.access_token) {
        secureStorage.setItem('sb-access-token', { access_token: result.session.access_token, refresh_token: result.session.refresh_token });
        window.location.href = '/recommendations';
      } else {
        setError('Nie udało się zalogować. Spróbuj ponownie.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
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
        />
        {errors.password && (
          <p className="text-sm text-red-500" id="password-error">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <a
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Zapomniałeś hasła?
        </a>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full">
        Zaloguj się
      </Button>

      <p className="text-center text-sm text-gray-600">
        Nie masz jeszcze konta?{' '}
        <a
          href="/auth/register"
          className="text-blue-600 hover:text-blue-800"
        >
          Zarejestruj się
        </a>
      </p>
    </form>
  );
} 