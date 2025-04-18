import { z } from 'zod';
import type {
  OpenRouterResponse,
  ModelParams,
  ResponseFormat,
  ChatMessage,
  OpenRouterRequest,
  OpenRouterOptions,
  ChatCompletionCreateParams,
  OpenRouterMessage,
  OpenRouterResponseFormat
} from './openrouter.types';

/**
 * Klasa usługi OpenRouter do komunikacji z API OpenRouter
 * umożliwiająca generowanie odpowiedzi na podstawie modeli językowych
 */
export class OpenRouterService {
  readonly baseUrl: string = 'https://openrouter.ai/api/v1';
  readonly defaultHeaders: Record<string, string>;
  public modelName: string;
  readonly systemMessage: string;
  private debugMode: boolean = true;
  private maxRetries: number = 2;
  private retryDelayMs: number = 1000;

  constructor(
    private readonly apiKey: string,
    modelName: string = 'gpt-4o-mini',
    systemMessage: string = ''
  ) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.modelName = modelName;
    this.systemMessage = systemMessage;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'https://boardmateai.com',
      'X-Title': 'BoardMate AI'
    };

    if (this.debugMode) {
      console.log(`Inicjalizacja OpenRouterService z modelem: ${this.modelName}`);
      console.log(`API key dostępny: ${this.apiKey ? 'Tak' : 'Nie'}`);
    }
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries: number = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (this.debugMode) {
        console.log(`OpenRouter API status: ${response.status}`);
      }
      
      // Sprawdź, czy mamy błąd HTTP i czy powinniśmy ponowić próbę
      if (!response.ok) {
        if (retries < this.maxRetries) {
          const errorData = await response.json().catch(() => ({ error: 'Nie udało się parsować odpowiedzi błędu' }));
          
          if (this.debugMode) {
            console.warn(`Próba ${retries + 1}/${this.maxRetries} nie powiodła się:`, errorData);
          }
          
          // Opóźnienie przed ponowną próbą
          await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
          
          // Rekurencyjnie ponów próbę
          return this.fetchWithRetry(url, options, retries + 1);
        }
        
        // Jeżeli przekroczyliśmy limit prób, wyrzuć błąd
        const errorData = await response.json().catch(() => null);
        throw new Error(`HTTP error ${response.status}: ${errorData ? JSON.stringify(errorData) : response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (this.debugMode) {
        console.error(`Błąd podczas wykonywania żądania OpenRouter:`, error);
      }
      
      if (retries < this.maxRetries) {
        if (this.debugMode) {
          console.warn(`Ponowna próba ${retries + 1}/${this.maxRetries} po błędzie sieci`);
        }
        
        // Opóźnienie przed ponowną próbą
        await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
        
        // Rekurencyjnie ponów próbę
        return this.fetchWithRetry(url, options, retries + 1);
      }
      
      // Jeżeli przekroczyliśmy limit prób, wyrzuć błąd
      throw error;
    }
  }

  /**
   * Generuje odpowiedź na podstawie wiadomości
   * @param messages Lista wiadomości
   * @param responseFormat Format odpowiedzi
   * @returns Promise z odpowiedzią
   */
  public async generateResponse(
    messages: OpenRouterMessage[],
    responseFormat?: OpenRouterResponseFormat,
    options?: OpenRouterOptions
  ): Promise<any> {
    if (!messages || messages.length === 0) {
      throw new Error("Musisz podać co najmniej jedną wiadomość");
    }

    // Dodaj wiadomość systemową na początku, jeśli jest zdefiniowana
    const systemMessage: OpenRouterMessage = { role: "system", content: this.systemMessage };
    const messagesWithSystem = this.systemMessage
      ? [systemMessage, ...messages]
      : messages;

    // Utwórz payload do wysłania
    const payload: ChatCompletionCreateParams = {
      messages: messagesWithSystem,
      model: this.modelName,
      response_format: responseFormat,
      stream: false,
      ...(options || {})
    };

    if (this.debugMode) {
      console.log("Wysyłanie zapytania:", JSON.stringify(payload, null, 2));
    }
    
    const endpoint = `${this.baseUrl}/chat/completions`;
    
    if (this.debugMode) {
      console.log(`OpenRouter żądanie do modelu ${this.modelName}:`, 
        { endpoint, headers: Object.keys(this.defaultHeaders), 
          messages: messagesWithSystem.map(m => ({ role: m.role, contentLength: m.content.length })),
          responseFormat: responseFormat ? responseFormat.type : 'none',
          options
        });
    }
    
    try {
      const response = await this.fetchWithRetry(endpoint, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (this.debugMode) {
        console.log(`OpenRouter odpowiedź otrzymana. Status: ${response.status}, ID: ${data.id || 'brak'}`);
      }
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error(`Nieprawidłowa odpowiedź z OpenRouter API: ${JSON.stringify(data)}`);
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      if (this.debugMode) {
        console.error(`Błąd podczas generowania odpowiedzi z OpenRouter:`, error);
      }
      
      throw new Error(`Nie udało się uzyskać odpowiedzi z OpenRouter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ustawia nazwę modelu do używania
   * @param modelName Nazwa modelu
   */
  public setModel(modelName: string): void {
    if (!modelName || modelName.trim() === "") {
      throw new Error("Nazwa modelu nie może być pusta");
    }
    this.modelName = modelName;
    
    if (this.debugMode) {
      console.log(`Model zmieniony na: ${this.modelName}`);
    }
  }
}

// Eksport instancji domyślnej dla łatwiejszego użycia
export const createOpenRouterService = (
  apiKey: string,
  modelName?: string,
  systemMessage?: string
): OpenRouterService => {
  // Walidacja klucza API
  if (!apiKey) {
    throw new Error("API key jest wymagany");
  }
  
  return new OpenRouterService(apiKey, modelName, systemMessage);
}; 