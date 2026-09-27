import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { CrowAvatar } from "./CrowAvatar";
import type { CrowChat, Message } from "./useCrowChat";

interface ChatProps {
  chat: CrowChat;
  /** Owned by App so other sections (FAQ) can move focus into the chat. */
  inputRef: RefObject<HTMLInputElement | null>;
  reducedMotion: boolean;
}

const timeFmt = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" });

function Bubble({ m }: { m: Message }) {
  const crow = m.role === "crow";
  return (
    <div className={`c16-msg c16-msg--${m.role}`}>
      {crow && <CrowAvatar size={28} label="" />}
      <div className="c16-bubble-col">
        <div className="c16-bubble">
          <span className="c16-sr">{crow ? "The Crow: " : "You: "}</span>
          {m.text}
          {m.links && m.links.length > 0 && (
            <span className="c16-bubble-links">
              {m.links.map((l) => (
                <a key={l.label + l.href} href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener noreferrer" : undefined}>
                  {l.label}
                  {l.external && <span aria-hidden="true"> ↗</span>}
                </a>
              ))}
            </span>
          )}
        </div>
        <time className="c16-time" dateTime={new Date(m.at).toISOString()}>
          {timeFmt.format(m.at)}
        </time>
      </div>
    </div>
  );
}

export function Chat({ chat, inputRef, reducedMotion }: ChatProps) {
  const { messages, typing, suggestions, send, clear } = chat;
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, typing, reducedMotion]);

  const ask = (q: string) => {
    send(q);
    inputRef.current?.focus();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.trim()) return;
    ask(draft);
    setDraft("");
  };

  const onClear = () => {
    clear();
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <section className="c16-chat" aria-labelledby="c16-chat-title">
      <header className="c16-chat-head">
        <CrowAvatar size={40} />
        <div className="c16-chat-who">
          <h2 id="c16-chat-title">The Crow</h2>
          <p className="c16-status">
            <span className="c16-dot" aria-hidden="true" />
            Online · scripted, not an AI
          </p>
        </div>
        <button type="button" className="c16-clear" onClick={onClear}>
          Clear chat
        </button>
      </header>

      <div ref={logRef} className="c16-log" role="log" aria-live="polite" aria-label="Conversation with the Crow">
        {messages.map((m) => (
          <Bubble key={m.id} m={m} />
        ))}
        {typing && (
          <div className="c16-msg c16-msg--crow c16-typing">
            <CrowAvatar size={28} label="" />
            <div className="c16-bubble" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="c16-sr">The Crow is typing</span>
          </div>
        )}
      </div>

      <div className="c16-chips" role="group" aria-label="Suggested questions">
        {suggestions.map((i) => (
          <button type="button" key={i.id} className="c16-chip" onClick={() => ask(i.label)}>
            {i.label}
          </button>
        ))}
      </div>

      <form className="c16-compose" onSubmit={onSubmit}>
        <label htmlFor={inputId} className="c16-sr">
          Ask the Crow a question
        </label>
        <input
          id={inputId}
          ref={inputRef}
          className="c16-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask the Crow… (Enter to send)"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={200}
        />
        <button type="submit" className="c16-send" disabled={!draft.trim()} aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 11l18-8-8 18-2-8-8-2z" fill="currentColor" />
          </svg>
        </button>
      </form>
    </section>
  );
}
