import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterService } from "../lib/openrouter.service";
import type { OpenRouterResponse } from "../lib/openrouter.types";

// Mock dla globalnego fetch
global.fetch = vi.fn();

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const mockApiKey = "test-api-key";
  const mockModelName = "test-model";
  const mockSystemMessage = "test-system-message";

  beforeEach(() => {
    service = new OpenRouterService(mockApiKey, mockModelName, mockSystemMessage);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("powinien rzucić błąd, gdy klucz API nie jest dostarczony", () => {
      expect(() => new OpenRouterService("")).toThrow("API key jest wymagany");
    });

    it("powinien poprawnie inicjalizować pola", () => {
      expect(service.apiKey).toBe(mockApiKey);
      expect(service.modelName).toBe(mockModelName);
    });
  });

  describe("setModel", () => {
    it("powinien rzucić błąd, gdy nazwa modelu jest pusta", () => {
      expect(() => service.setModel("")).toThrow("Nazwa modelu nie może być pusta");
    });

    it("powinien aktualizować nazwę modelu", () => {
      const newModelName = "new-model";
      service.setModel(newModelName);
      expect(service.modelName).toBe(newModelName);
    });
  });

  describe("generateResponse", () => {
    const mockUserMessage = "test-user-message";
    const mockResponseContent = "test-response-content";

    const mockSuccessResponse: OpenRouterResponse = {
      id: "test-id",
      choices: [
        {
          message: {
            content: mockResponseContent,
            role: "assistant",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
      model: mockModelName,
      created: Date.now(),
    };

    it("powinien rzucić błąd, gdy wiadomość użytkownika jest pusta", async () => {
      await expect(service.generateResponse("")).rejects.toThrow(
        "Błąd podczas generowania odpowiedzi: Wiadomość użytkownika jest wymagana"
      );
    });

    it("powinien zwrócić odpowiedź modelu w przypadku powodzenia", async () => {
      // Mock dla fetch zwracający sukces
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      const response = await service.generateResponse(mockUserMessage);

      expect(response).toBe(mockResponseContent);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchArgs = (global.fetch as any).mock.calls[0];
      expect(fetchArgs[0]).toContain("/chat/completions");

      const requestBody = JSON.parse(fetchArgs[1].body);
      expect(requestBody.model).toBe(mockModelName);
      expect(requestBody.messages).toContainEqual({
        role: "system",
        content: mockSystemMessage,
      });
      expect(requestBody.messages).toContainEqual({
        role: "user",
        content: mockUserMessage,
      });
    });

    it("powinien obsłużyć błąd HTTP", async () => {
      const errorMessage = "Błąd API";

      // Mock dla fetch zwracający błąd
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: errorMessage } }),
      });

      await expect(service.generateResponse(mockUserMessage)).rejects.toThrow(
        `Błąd podczas generowania odpowiedzi: Błąd podczas komunikacji z API: ${errorMessage}`
      );
    });

    it("powinien obsłużyć błąd sieci", async () => {
      const networkError = new Error("Network error");

      // Mock dla fetch rzucający błąd sieci
      (global.fetch as any).mockRejectedValueOnce(networkError);

      await expect(service.generateResponse(mockUserMessage)).rejects.toThrow(
        `Błąd podczas generowania odpowiedzi: Błąd podczas komunikacji z API: Network error`
      );
    });

    it("powinien obsłużyć pustą odpowiedź z API", async () => {
      // Mock dla fetch zwracający pustą odpowiedź
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "test-id", choices: [] }),
      });

      await expect(service.generateResponse(mockUserMessage)).rejects.toThrow(
        "Błąd podczas generowania odpowiedzi: Otrzymano pustą odpowiedź z API"
      );
    });

    it("powinien obsłużyć brak treści w odpowiedzi", async () => {
      // Mock dla fetch zwracający odpowiedź bez treści
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            choices: [{ message: { content: "", role: "assistant" }, finish_reason: "stop", index: 0 }],
          }),
      });

      await expect(service.generateResponse(mockUserMessage)).rejects.toThrow(
        "Błąd podczas generowania odpowiedzi: Otrzymano pustą treść odpowiedzi"
      );
    });
  });
});
