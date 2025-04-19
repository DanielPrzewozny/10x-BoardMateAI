import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabaseClient } from '@/db/supabase.client';
import { Loader2 } from "lucide-react";

export function LogoutForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        setError(result.error);
        return;
      }

      // Usuń token z localStorage
      localStorage.removeItem('sb-access-token');
      window.location.href = '/';
      
    } catch (err) {
      setError('Wystąpił błąd podczas wylogowywania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatycznie wywołaj wylogowanie po załadowaniu komponentu
  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-center text-gray-600">Trwa wylogowywanie...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
} 