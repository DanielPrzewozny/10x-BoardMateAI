import React, { useEffect, useState } from "react";
import SavedRecommendations from "./SavedRecommendations";
import { Toaster } from "./ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { supabaseClient } from "@/db/supabase.client";
import { secureStorage } from "@/lib/utils/secureStorage";

export default function SavedRecommendationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState("Inicjalizacja...");

  // Prosta funkcja sprawdzająca sesję
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Sprawdź sesję Supabase
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error("Błąd podczas pobierania sesji:", error);
          setDebugInfo((prev) => prev + "\nBłąd Supabase: " + error.message);
          setError("Wystąpił problem z weryfikacją sesji");
          setUser(null);
          return;
        }

        if (data.session && data.session.user) {
          console.log("Znaleziono aktywną sesję:", data.session.user.email);
          setDebugInfo((prev) => prev + "\nSesja aktywna: " + data.session.user.email);
          setUser(data.session.user);

          // Zaktualizuj dane w localStorage
          secureStorage.setItem("sb-access-token", data.session);
        } else {
          console.log("Brak aktywnej sesji w API Supabase");
          setDebugInfo((prev) => prev + "\nBrak aktywnej sesji w API");

          // Sprawdź localStorage jako ostatnią deskę ratunku
          try {
            const savedSession = secureStorage.getItem("sb-access-token");
            if (savedSession?.user) {
              console.log("Próba odtworzenia sesji z localStorage...");
              setDebugInfo((prev) => prev + "\nPróba odtworzenia z localStorage: " + savedSession.user.email);

              // Sprawdź, czy sesja nie wygasła
              if (savedSession.expires_at && savedSession.expires_at * 1000 < Date.now()) {
                console.log("Sesja wygasła:", new Date(savedSession.expires_at * 1000).toLocaleString());
                setDebugInfo((prev) => prev + "\nSesja wygasła");
                setError("Twoja sesja wygasła. Proszę zalogować się ponownie.");
                secureStorage.removeItem("sb-access-token");
                setUser(null);
                return;
              }

              // Spróbuj przywrócić sesję
              const { data: restoreData, error: restoreError } = await supabaseClient.auth.setSession(savedSession);

              if (restoreError) {
                console.error("Nie udało się przywrócić sesji:", restoreError);
                setDebugInfo((prev) => prev + "\nBłąd przywracania: " + restoreError.message);
                setError("Sesja wygasła lub jest nieprawidłowa");
                secureStorage.removeItem("sb-access-token");
                setUser(null);
              } else if (restoreData?.user) {
                console.log("Pomyślnie przywrócono sesję:", restoreData.user.email);
                setDebugInfo((prev) => prev + "\nPrzywrócono sesję: " + restoreData.user.email);
                setUser(restoreData.user);
              } else {
                console.log("Brak danych użytkownika po przywróceniu sesji");
                setDebugInfo((prev) => prev + "\nBrak danych po przywróceniu");
                setError("Nie udało się zweryfikować tożsamości");
                setUser(null);
              }
            } else {
              console.log("Brak zapisanej sesji w localStorage");
              setDebugInfo((prev) => prev + "\nBrak sesji w localStorage");
              setError("Nie jesteś zalogowany");
              setUser(null);
            }
          } catch (e) {
            console.error("Błąd podczas sprawdzania localStorage:", e);
            setDebugInfo((prev) => prev + "\nBłąd localStorage: " + String(e));
            setError("Błąd weryfikacji danych sesji");
            setUser(null);
          }
        }
      } catch (e) {
        console.error("Nieoczekiwany błąd podczas weryfikacji:", e);
        setDebugInfo((prev) => prev + "\nNieoczekiwany błąd: " + String(e));
        setError("Wystąpił nieoczekiwany błąd");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Wyczyść sesję i wykonaj przekierowanie
  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Wyczyść localStorage
      secureStorage.removeItem("sb-access-token");

      // Wyloguj z Supabase
      await supabaseClient.auth.signOut();

      // Wyczyść wszystkie localStorage
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => window.localStorage.removeItem(key));

      // Usuń wszystkie ciasteczka
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Przekieruj do strony logowania
      window.location.href = "/auth/login?reason=logout";
    } catch (e) {
      console.error("Błąd podczas wylogowywania:", e);
      setError("Błąd podczas wylogowywania");
      setIsLoading(false);
    }
  };

  // Ręczne odświeżenie sesji
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setDebugInfo((prev) => prev + "\nOdświeżanie sesji...");

      // Odśwież sesję
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        setDebugInfo((prev) => prev + "\nBłąd odświeżania: " + error.message);
        setError("Błąd odświeżania sesji: " + error.message);
      } else if (data.session) {
        setDebugInfo((prev) => prev + "\nSesja odświeżona: " + data.session.user.email);
        setUser(data.session.user);
        secureStorage.setItem("sb-access-token", data.session);
        setError(null);
      } else {
        setDebugInfo((prev) => prev + "\nBrak sesji po odświeżeniu");
        setError("Nie udało się odświeżyć sesji");
      }
    } catch (e) {
      console.error("Błąd podczas odświeżania:", e);
      setDebugInfo((prev) => prev + "\nBłąd odświeżania: " + String(e));
      setError("Wystąpił błąd podczas odświeżania");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderowanie podczas ładowania
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Zapisane rekomendacje</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-lg font-medium">Sprawdzanie sesji...</p>
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left whitespace-pre-wrap max-h-40 overflow-auto">
                {debugInfo}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gdy użytkownik nie jest zalogowany
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Zapisane rekomendacje</h1>
        <Card>
          <CardHeader>
            <CardTitle>Dostęp ograniczony</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-lg font-medium">
                {error || "Musisz być zalogowany, aby zobaczyć swoje zapisane rekomendacje"}
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <a href="/auth/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80">
                  Zaloguj się
                </a>
                <Button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  Odśwież sesję
                </Button>
              </div>
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left whitespace-pre-wrap max-h-40 overflow-auto">
                {debugInfo}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gdy użytkownik jest zalogowany
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Zapisane rekomendacje</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {user.email}
          </div>
          <Button 
            onClick={handleLogout} 
            className="bg-red-100 text-red-800 hover:bg-red-200"
            size="sm"
          >
            Wyloguj
          </Button>
          <Button 
            onClick={handleRefresh} 
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            size="sm"
          >
            Odśwież
          </Button>
        </div>
      </div> */}

      {error && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      <SavedRecommendations />
      <Toaster />

      {/* <div className="mt-8 p-2 bg-gray-100 rounded text-xs text-left whitespace-pre-wrap max-h-40 overflow-auto mx-auto max-w-3xl">
        <p className="font-bold mb-1">Debug info:</p>
        {debugInfo}
      </div> */}
    </div>
  );
}
