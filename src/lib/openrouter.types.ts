/**
 * Interfejs dla odpowiedzi z API OpenRouter
 */
export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  model: string;
  created: number;
}

/**
 * Interfejs dla parametrów modelu
 */
export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Interfejs dla formatu odpowiedzi
 */
export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, any>;
  };
}

/**
 * Interfejs dla komunikatów w czacie
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interfejs dla żądania do API OpenRouter
 */
export interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  seed?: number;
  tools?: any[];
  tool_choice?: string | { function: { name: string } };
}

/**
 * Wiadomość dla OpenRouter API
 */
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Format odpowiedzi OpenRouter
 */
export interface OpenRouterResponseFormat {
  type: 'json_schema' | 'text';
  json_schema?: {
    name: string;
    strict?: boolean;
    schema: Record<string, any>;
  };
}

/**
 * Parametry dla zapytania do OpenRouter API
 */
export interface ChatCompletionCreateParams {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: OpenRouterResponseFormat;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  seed?: number;
  tools?: any[];
  tool_choice?: string | { function: { name: string } };
} 