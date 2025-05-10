import { useState, useCallback } from "react";
import type { ResponseFormat } from "../../lib/openrouter.types";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

interface ChatOptions {
  modelName?: string;
  responseFormat?: ResponseFormat;
  systemMessage?: string;
}

export const useChat = (options: ChatOptions = {}) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const addMessage = useCallback((message: ChatMessage) => {
    setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      // Dodaj wiadomość użytkownika do stanu
      const userMessage: ChatMessage = { role: "user", content };
      setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Wywołaj API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            modelName: options.modelName,
            responseFormat: options.responseFormat,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Wystąpił błąd podczas komunikacji z API");
        }

        const data = await response.json();

        // Dodaj odpowiedź asystenta do stanu
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.response,
        };

        setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, assistantMessage],
          isLoading: false,
        }));

        return data.response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Nieznany błąd podczas wysyłania wiadomości";

        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: errorMessage,
        }));

        return null;
      }
    },
    [options.modelName, options.responseFormat]
  );

  const clearMessages = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      messages: [],
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      error: null,
    }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    addMessage,
    clearMessages,
    clearError,
  };
};
