import React, { useState, useRef, useEffect } from "react";
import { useChat, type ChatMessage } from "./hooks/useChat";
import type { ResponseFormat } from "../lib/openrouter.types";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Send, Trash } from "lucide-react";

interface ChatUIProps {
  modelName?: string;
  responseFormat?: ResponseFormat;
  systemMessage?: string;
  title?: string;
}

export const ChatUI: React.FC<ChatUIProps> = ({
  modelName,
  responseFormat,
  systemMessage,
  title = "Asystent BoardMateAI",
}) => {
  const { messages, isLoading, error, sendMessage, clearMessages, clearError } = useChat({
    modelName,
    responseFormat,
    systemMessage,
  });

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Przewijanie do najnowszej wiadomości
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue("");
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === "user";

    return (
      <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`max-w-[80%] p-3 rounded-lg ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {messages.length > 0 && (
            <Button variant="outline" size="icon" onClick={clearMessages} title="Wyczyść czat">
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[500px] min-h-[300px]">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" onClick={clearError} className="mt-2">
              Zamknij
            </Button>
          </Alert>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground">
            <p>Rozpocznij rozmowę z asystentem BoardMateAI...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Napisz wiadomość..."
            className="resize-none min-h-[60px]"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
