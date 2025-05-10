import React, { useState, useEffect, useRef } from "react";
import type { ProfileDTO } from "@/types";

const defaultProfile: ProfileDTO = {
  first_name: "",
  last_name: "",
  email: "",
};

interface ProfileFormProps {
  profile: ProfileDTO;
  onChange: (data: Partial<ProfileDTO>) => void;
  onSubmit: (data: ProfileDTO) => void;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onChange, onSubmit, isLoading }) => {
  console.log("ProfileForm render z profilem:", profile);

  // Wprowadzamy lokalny stan dla formularza
  const [formValues, setFormValues] = useState<ProfileDTO>({
    ...defaultProfile,
    ...profile,
  });

  // Ref do śledzenia poprzednich wartości profilu
  const prevProfileRef = useRef<ProfileDTO | null>(null);

  // Aktualizacja lokalnego stanu gdy props się zmienia
  useEffect(() => {
    // Bezpieczna funkcja do porównania obiektów, nawet jeśli są undefined
    const hasChanged = (): boolean => {
      if (!prevProfileRef.current) return true;

      // Porównujemy tylko pola wyświetlane w formularzu
      return (
        profile.first_name !== prevProfileRef.current.first_name ||
        profile.last_name !== prevProfileRef.current.last_name ||
        profile.email !== prevProfileRef.current.email
      );
    };

    if (hasChanged()) {
      console.log("Wykryto zmianę w profilu, aktualizuję formularz");
      console.log("Poprzedni profil:", prevProfileRef.current);
      console.log("Nowy profil:", profile);

      // Aktualizujemy formularz nowymi wartościami
      setFormValues({
        ...defaultProfile,
        ...profile,
      });

      // Zapisujemy aktualny profil jako poprzedni
      prevProfileRef.current = { ...profile };
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Wysyłanie formularza z wartościami:", formValues);

    // Upewniamy się, że przekazujemy ID jeśli jest dostępne
    const dataToSubmit = {
      ...formValues,
      id: profile.id, // Zachowujemy id z oryginalnego profilu
      user_id: (profile as any).user_id, // Zachowujemy user_id jeśli istnieje
    };

    console.log("Przygotowane dane do zapisu:", dataToSubmit);
    onSubmit(dataToSubmit);
  };

  const handleChange = (field: keyof ProfileDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`Zmiana pola ${field}: '${value}'`);

    // Aktualizacja lokalnego stanu formularza
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Informowanie rodzica o zmianie
    onChange({
      [field]: value,
    });
  };

  // Jeśli nie mamy profilu, nie renderuj formularza
  if (!profile) {
    return <div>Ładowanie profilu...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Dane profilu</h2>

        <div className="space-y-6">
          {/* Imię */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              Imię
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="first_name"
                name="first_name"
                autoComplete="given-name"
                value={formValues.first_name ?? ""}
                onChange={handleChange("first_name")}
                required
                minLength={2}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Nazwisko */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Nazwisko
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="last_name"
                name="last_name"
                autoComplete="family-name"
                value={formValues.last_name ?? ""}
                onChange={handleChange("last_name")}
                required
                minLength={2}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formValues.email ?? ""}
                disabled
                className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Adres email nie może być zmieniony</p>
            </div>
          </div>

          {/* ID do debugowania */}
          <div className="text-xs text-gray-400">
            <p>ID: {profile.id || "brak"}</p>
            <p>User ID: {(profile as any).user_id || "brak"}</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }
            `}
          >
            {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </div>
    </form>
  );
};
