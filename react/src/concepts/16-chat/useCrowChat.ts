/**
 * Chat state: messages, a reply queue (drives the typing indicator),
 * suggestion chips derived from the last intent, and sessionStorage persistence.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { GREETING, intentById, matchIntent, type ChatLink, type Intent } from "./intents";

export interface Message {
  id: string;
  role: "crow" | "you";
  text: string;
  links?: ChatLink[];
  /** Intent id for crow messages; "greeting" for the opener. */
  intent?: string;
  /** Epoch ms. */
  at: number;
}

export interface CrowChat {
  messages: Message[];
  typing: boolean;
  suggestions: Intent[];
  send: (text: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "notc16-chat";
const START_CHIPS = ["dates", "price", "kidsday", "scenes", "secret"] as const;

let seq = 0;
const nextId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

const greeting = (): Message => ({ id: nextId(), role: "crow", text: GREETING.text, intent: "greeting", at: Date.now() });

function isMessage(m: unknown): m is Message {
  if (typeof m !== "object" || m === null) return false;
  const r = m as Record<string, unknown>;
  return typeof r.id === "string" && (r.role === "crow" || r.role === "you") && typeof r.text === "string" && typeof r.at === "number";
}

function load(): Message[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const msgs = parsed.filter(isMessage);
    return msgs.length ? msgs : null;
  } catch {
    return null;
  }
}

export function useCrowChat(): CrowChat {
  const [messages, setMessages] = useState<Message[]>(() => load() ?? [greeting()]);
  const [queue, setQueue] = useState<Message[]>([]);
  const head = queue[0];
  const typing = head !== undefined;

  // Deliver the head of the queue after a human-feeling pause (400–900 ms).
  useEffect(() => {
    if (!head) return;
    const delay = 400 + Math.random() * 500;
    const t = window.setTimeout(() => {
      setMessages((m) => [...m, head]);
      setQueue((q) => q.filter((x) => x.id !== head.id));
    }, delay);
    return () => window.clearTimeout(t);
  }, [head]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage unavailable: chat still works for this page view */
    }
  }, [messages]);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const intent = matchIntent(text);
    const reply = intent.reply();
    setMessages((m) => [...m, { id: nextId(), role: "you", text, at: Date.now() }]);
    setQueue((q) => [...q, { id: nextId(), role: "crow", text: reply.text, links: reply.links, intent: intent.id, at: Date.now() }]);
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setMessages([greeting()]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const lastIntent = useMemo(() => [...messages].reverse().find((m) => m.role === "crow")?.intent ?? "greeting", [messages]);
  const suggestions = useMemo(() => {
    const ids = lastIntent === "greeting" ? START_CHIPS : intentById(lastIntent).next;
    return ids.map(intentById);
  }, [lastIntent]);

  return { messages, typing, suggestions, send, clear };
}
