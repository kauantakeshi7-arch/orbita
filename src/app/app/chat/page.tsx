"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) =>
        setMessages(
          (data.messages ?? []).map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          }))
        )
      )
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setMessages((prev) => [...(prev ?? []), { role: "user", content: text }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...(prev ?? []), { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...(prev ?? []),
        { role: "assistant", content: "Deu ruim aqui do meu lado — tenta de novo?" },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <p className="font-mono-label text-xs text-ink-dim mb-3">pergunte sobre seu mapa</p>

      <div className="flex-1 overflow-y-auto rounded-xl border border-line bg-surface p-4 flex flex-col gap-3">
        {messages === undefined && <p className="text-ink-muted text-sm">carregando…</p>}
        {messages?.length === 0 && (
          <p className="text-ink-muted text-sm">
            Pergunte qualquer coisa sobre o seu mapa astral — por exemplo &quot;o que significa minha
            Lua em Sagitário?&quot; ou &quot;como meu Ascendente influencia minhas primeiras
            impressões?&quot;
          </p>
        )}
        {messages?.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-accent text-ground"
                : "self-start bg-surface-2 text-ink-muted border border-line"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="self-start bg-surface-2 text-ink-dim border border-line rounded-xl px-4 py-2.5 text-sm">
            digitando…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre seu mapa…"
          className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-accent text-ground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
