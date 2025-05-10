import { useState, useCallback, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/db/supabase.client";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/services/auth.service";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const { toast } = useToast();

  const redirectToHome = useCallback(() => {
    if (typeof window !== "undefined") {
      // Usuń token z localStorage
      localStorage.removeItem("sb-access-token");
      // Przekieruj na stronę główną
      window.location.href = "/";
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsOpen(false);

      toast({
        title: "Wylogowywanie...",
        description: "Trwa wylogowywanie, proszę czekać...",
      });

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Wystąpił błąd podczas wylogowywania");
      }

      // Natychmiast ustaw stan wylogowania
      setIsSignedOut(true);
      setIsLoading(false);

      toast({
        title: "Wylogowano pomyślnie",
        description: "Za chwilę nastąpi przekierowanie...",
      });

      // Przekieruj po krótkim opóźnieniu
      setTimeout(redirectToHome, 5000);
      // Przekieruj na stronę główną
      window.location.href = "/";
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd wylogowania",
        description: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas wylogowywania",
      });
      setIsLoading(false);
    }
  }, [toast, redirectToHome]);

  // Jeśli użytkownik jest wylogowany, pokazujemy przyciski logowania/rejestracji
  if (isSignedOut || !user) {
    return (
      <div className="space-x-4">
        <a href="/auth/login" className="text-sm font-medium hover:text-blue-600 transition-colors">
          Zaloguj się
        </a>
        <a
          href="/auth/register"
          className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Zarejestruj się
        </a>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          aria-label="Menu użytkownika"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden md:inline-block">Wylogowywanie...</span>
            </>
          ) : (
            <>
              <UserIcon className="h-5 w-5" />
              <span className="hidden md:inline-block">{user.email}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            {isLoading ? "Wylogowywanie..." : "Wyloguj się"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
