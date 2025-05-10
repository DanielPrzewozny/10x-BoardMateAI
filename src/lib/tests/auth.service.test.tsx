import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService, AuthError } from "../services/auth.service";
import { secureStorage } from "@/lib/utils/secureStorage";
import { supabaseClient } from "@/db/supabase.client";

// Mock supabaseClient
vi.mock("@/db/supabase.client", () => {
  const mockSupabaseClient = {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      initialize: vi.fn(),
    },
  };

  return {
    supabaseClient: mockSupabaseClient,
  };
});

// Mock secureStorage
vi.mock("@/lib/utils/secureStorage", () => ({
  secureStorage: {
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("AuthService", () => {
  let mockWindow: any;
  let mockDocument: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window
    mockWindow = {
      localStorage: {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      location: {
        hostname: "test.com",
        href: "",
      },
    };

    // Mock document
    mockDocument = {
      cookie: "",
    };

    // Ustaw globalne obiekty
    global.window = mockWindow;
    global.document = mockDocument;
  });

  describe("signIn", () => {
    const testEmail = "test@example.com";
    const testPassword = "password123";
    const mockSession = {
      access_token: "test-token",
      user: { email: testEmail },
    };

    it("powinno zalogować użytkownika i zapisać sesję", async () => {
      // Arrange
      const mockAuthResponse = {
        data: { session: mockSession },
        error: null,
      };
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue(mockAuthResponse as any);

      // Act
      const result = await authService.signIn(testEmail, testPassword);

      // Assert
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      });
      expect(secureStorage.setItem).toHaveBeenCalledWith("sb-access-token", mockSession);
      expect(result).toEqual(mockAuthResponse.data);
    });

    it("powinno rzucić wyjątek gdy wystąpi błąd logowania", async () => {
      // Arrange
      const errorMessage = "Invalid credentials";
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: { message: errorMessage },
      } as any);

      // Act & Assert
      await expect(authService.signIn(testEmail, testPassword)).rejects.toThrow(errorMessage);
    });

    it("powinno rzucić wyjątek gdy nie utworzono sesji", async () => {
      // Arrange
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      // Act & Assert
      await expect(authService.signIn(testEmail, testPassword)).rejects.toThrow("Nie udało się utworzyć sesji");
    });
  });

  describe("signOut", () => {
    it("powinno wylogować użytkownika i wyczyścić dane", async () => {
      // Arrange
      vi.mocked(supabaseClient.auth.signOut).mockResolvedValue({ error: null } as any);
      vi.mocked(supabaseClient.auth.initialize).mockResolvedValue({} as any);

      // Act
      await authService.signOut();

      // Assert
      expect(supabaseClient.auth.signOut).toHaveBeenCalledWith({ scope: "global" });
      expect(supabaseClient.auth.initialize).toHaveBeenCalled();
      expect(secureStorage.removeItem).toHaveBeenCalledWith("sb-access-token");
      expect(window.localStorage.removeItem).toHaveBeenCalled();
      expect(window.location.href).toBe("/");
    });

    it("powinno obsłużyć błąd wylogowania", async () => {
      // Arrange
      const errorMessage = "Logout error";
      vi.mocked(supabaseClient.auth.signOut).mockResolvedValue({
        error: { message: errorMessage },
      } as any);

      // Act
      await authService.signOut();

      // Assert
      expect(secureStorage.removeItem).toHaveBeenCalled();
      expect(window.location.href).toBe("/");
    });

    it("powinno obsłużyć błąd inicjalizacji", async () => {
      // Arrange
      vi.mocked(supabaseClient.auth.signOut).mockResolvedValue({ error: null } as any);
      vi.mocked(supabaseClient.auth.initialize).mockRejectedValue(new Error("Init error"));

      // Act
      await authService.signOut();

      // Assert
      expect(supabaseClient.auth.signOut).toHaveBeenCalled();
      expect(supabaseClient.auth.initialize).toHaveBeenCalled();
      expect(window.location.href).toBe("/");
    });
  });

  describe("getSession", () => {
    it("powinno zwrócić aktywną sesję", async () => {
      // Arrange
      const mockSession = { user: { email: "test@example.com" } };
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      // Act
      const result = await authService.getSession();

      // Assert
      expect(result).toEqual(mockSession);
    });

    it("powinno rzucić wyjątek gdy wystąpi błąd", async () => {
      // Arrange
      const errorMessage = "Session error";
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { message: errorMessage },
      } as any);

      // Act & Assert
      await expect(authService.getSession()).rejects.toThrow(errorMessage);
    });
  });

  describe("onAuthStateChange", () => {
    it("powinno zarejestrować callback dla zmiany stanu autoryzacji", () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabaseClient.auth.onAuthStateChange).mockReturnValue(mockUnsubscribe as any);

      // Act
      const result = authService.onAuthStateChange(mockCallback);

      // Assert
      expect(supabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe("clearAllStorageData", () => {
    it("powinno wyczyścić wszystkie dane z localStorage i cookies", async () => {
      // Arrange
      document.cookie = "test-cookie=value; sb-refresh-token=token;";

      // Act
      await authService.clearAllStorageData();

      // Assert
      expect(secureStorage.removeItem).toHaveBeenCalledWith("sb-access-token");
      expect(window.localStorage.removeItem).toHaveBeenCalledWith("supabase.auth.token");
      expect(window.localStorage.removeItem).toHaveBeenCalledWith("supabase.auth.token.type");
    });

    it("powinno obsłużyć błędy podczas czyszczenia localStorage", async () => {
      // Arrange
      const removeItemMock = vi.fn().mockImplementation(() => {
        console.error("Błąd podczas czyszczenia localStorage");
        return Promise.resolve();
      });
      window.localStorage = {
        ...window.localStorage,
        removeItem: removeItemMock,
      };

      // Act
      await authService.clearAllStorageData();

      // Assert
      expect(secureStorage.removeItem).toHaveBeenCalledWith("sb-access-token");
      expect(removeItemMock).toHaveBeenCalled();
    });
  });
});
