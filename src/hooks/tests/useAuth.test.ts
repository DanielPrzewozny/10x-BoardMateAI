import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { supabaseClient } from "@/db/supabase.client";
import { secureStorage } from "@/lib/utils/secureStorage";
import type { Session, AuthChangeEvent, Subscription, User } from "@supabase/supabase-js";

// Mockowanie modułów
vi.mock("@/db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
      setSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
            id: "mock-subscription-id",
            callback: vi.fn(),
          },
        },
      })),
    },
  },
}));

vi.mock("@/lib/utils/secureStorage", () => ({
  secureStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("useAuth hook", () => {
  // Rozszerzony mockUser o wymagane pola z interfejsu User
  const mockUser: Partial<User> = {
    id: "user-123",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  // Uzupełniono brakujące właściwości: expires_in, token_type
  const mockSession: Session = {
    user: mockUser as User,
    access_token: "valid-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Symulacja globalnego obiektu window
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    Object.defineProperty(global, "window", {
      value: {
        localStorage: localStorageMock,
        location: {
          origin: "http://localhost:3000",
          href: "http://localhost:3000",
        },
      },
      writable: true,
    });

    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinien zwrócić null dla user i isLoading=false gdy nie ma sesji", async () => {
    // Ustawienie mocków
    vi.mocked(secureStorage.getItem).mockReturnValue(null);
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Renderowanie hooka
    const { result } = renderHook(() => useAuth());

    // Oczekiwanie na zakończenie asynchronicznych operacji
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Sprawdzenie rezultatu
    expect(result.current.user).toBeNull();
  });

  it("powinien ustawić user gdy istnieje zapisana sesja", async () => {
    // Ustawienie mocków
    vi.mocked(secureStorage.getItem).mockReturnValue(mockSession);
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Renderowanie hooka
    const { result } = renderHook(() => useAuth());

    // Oczekiwanie na zakończenie asynchronicznych operacji
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Sprawdzenie rezultatu
    expect(result.current.user).toEqual(mockUser);
  });

  it("powinien reagować na zdarzenie SIGNED_IN", async () => {
    // Ustawienie mocków
    vi.mocked(secureStorage.getItem).mockReturnValue(null);
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Przygotowanie funkcji symulującej zdarzenia auth
    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;

    // Poprawiony mock dla onAuthStateChange
    vi.mocked(supabaseClient.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
            id: "mock-subscription-id",
            callback: vi.fn(),
          } as unknown as Subscription,
        },
      };
    });

    // Renderowanie hooka
    const { result } = renderHook(() => useAuth());

    // Oczekiwanie na zakończenie asynchronicznych operacji
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Symulacja zdarzenia logowania
    await act(async () => {
      authChangeCallback!("SIGNED_IN", mockSession);
    });

    // Sprawdzenie czy hook zaktualizował stan
    expect(secureStorage.setItem).toHaveBeenCalledWith("sb-access-token", mockSession);
    expect(result.current.user).toEqual(mockUser);
  });

  it("powinien reagować na zdarzenie SIGNED_OUT", async () => {
    // Ustawienie mocków
    vi.mocked(secureStorage.getItem).mockReturnValue(mockSession);
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Przygotowanie funkcji symulującej zdarzenia auth
    let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;

    // Poprawiony mock dla onAuthStateChange
    vi.mocked(supabaseClient.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
            id: "mock-subscription-id",
            callback: vi.fn(),
          } as unknown as Subscription,
        },
      };
    });

    // Renderowanie hooka
    const { result } = renderHook(() => useAuth());

    // Oczekiwanie na zakończenie asynchronicznych operacji
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Symulacja zdarzenia wylogowania
    await act(async () => {
      authChangeCallback!("SIGNED_OUT", null);
    });

    // Sprawdzenie rezultatu
    expect(secureStorage.removeItem).toHaveBeenCalledWith("sb-access-token");
    expect(result.current.user).toBeNull();
  });
});
