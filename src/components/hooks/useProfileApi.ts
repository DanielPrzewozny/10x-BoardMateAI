import { useState, useEffect } from "react";
import type { ProfileDTO } from "@/types";

type ProfileFormData = Omit<ProfileDTO, "id" | "account_status">;

interface UseProfileApiReturn {
  updateProfile: (data: ProfileFormData) => Promise<void>;
  getProfile: () => Promise<ProfileDTO | null>;
  profile: ProfileDTO | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfileApi(): UseProfileApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDTO | null>(null);

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile");

      if (!response.ok) {
        throw new Error("Nie udało się pobrać profilu");
      }

      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować profilu");
      }

      const result = await response.json();
      setProfile(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return {
    updateProfile,
    getProfile,
    profile,
    isLoading,
    error,
  };
}
