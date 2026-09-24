import * as React from 'react';
import { useAui, useAuiState } from '@assistant-ui/react';

type ThreadApi = {
  append: (m: { role: 'user'; content: Array<{ type: 'text'; text: string }> }) => void;
  getState: () => { messages: ReadonlyArray<{ id: string; role: string }>; isRunning: boolean };
  message: (selector: { id: string }) => { reload: () => void };
};
const RETRY_MS = 100;
const threadOf = (aui: ReturnType<typeof useAui>) => (aui as unknown as { thread: () => ThreadApi }).thread();

/** Envía una pregunta al montar (una vez, también en StrictMode), para que la demo arranque con una respuesta. */
export function AuiAsk({ question }: { question: string }) {
  const aui = useAui();
  const sent = React.useRef(false);
  const ready = useAuiState((s) => !s.threads.isLoading && !s.thread.isLoading);
  React.useEffect(() => {
    if (sent.current || !ready) return undefined;
    let retry: number | undefined;
    // Mientras la lista de hilos arranca, el hilo principal es un marcador que no acepta mensajes: se reintenta.
    const trySend = () => {
      try {
        threadOf(aui).append({ role: 'user', content: [{ type: 'text', text: question }] });
        sent.current = true;
      } catch {
        retry = window.setTimeout(trySend, RETRY_MS);
      }
    };
    trySend();
    return () => window.clearTimeout(retry);
  }, [aui, question, ready]);
  return null;
}

/** Regenera la última respuesta del hilo. */
export function useAuiRegenerate() {
  const aui = useAui();
  return React.useCallback(() => {
    const thread = threadOf(aui);
    const { messages, isRunning } = thread.getState();
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    if (last && !isRunning) thread.message({ id: last.id }).reload();
  }, [aui]);
}

/** Envía un mensaje al hilo. */
export function useAuiSend() {
  const aui = useAui();
  return React.useCallback((text: string) => threadOf(aui).append({ role: 'user', content: [{ type: 'text', text }] }), [aui]);
}
