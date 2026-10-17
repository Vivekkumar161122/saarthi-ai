'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SupportedLanguage } from '../src/core/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UseGenAICopilotOptions {
  workerName: string;
  language: SupportedLanguage;
  apiEndpoint?: string;
}

export function useGenAICopilot({
  workerName,
  language,
  apiEndpoint = '/api/chat'
}: UseGenAICopilotOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Stop active generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Send a message and stream response from edge API
  const sendMessage = useCallback(
    async (textToSend?: string, contextDomain?: string) => {
      const prompt = (textToSend || input).trim();
      if (!prompt || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now()
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');
      setIsLoading(true);

      const assistantMessageId = `asst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      setMessages([...newMessages, initialAssistantMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            workerName,
            language,
            contextDomain
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body stream is unavailable.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: accumulated } : msg
            )
          );
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Streaming error:', err);
          setError(err.message || 'Stream connection error');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content:
                      '⚠️ Connection interrupted. Please check your internet or retry your question.'
                  }
                : msg
            )
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, messages, workerName, language, apiEndpoint]
  );

  // Clear chat conversation
  const clearMessages = useCallback(() => {
    stopGeneration();
    setMessages([]);
    setError(null);
  }, [stopGeneration]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages
  };
}
