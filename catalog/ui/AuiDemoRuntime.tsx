import * as React from 'react';
import {
  AssistantRuntimeProvider,
  AuiConfig,
  CompositeAttachmentAdapter,
  ExportedMessageRepository,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  Suggestions,
  createVoiceSession,
  useAui,
  useLocalRuntime,
  useRemoteThreadListRuntime,
  type ChatModelAdapter,
  type RealtimeVoiceAdapter,
  type RemoteThreadListAdapter,
  type SuggestionAdapter,
  type ThreadHistoryAdapter,
} from '@assistant-ui/react';

// Runtime de las demos AUI connected: el mismo @assistant-ui/react de producción, con un modelo de ejemplo, una lista
// de hilos en memoria (sembrada con los hilos del tablero) y una sesión de voz simulada.
export const DEMO_ANSWERS = [
  'Hay 3 anticipos pendientes por $3.930.000. El próximo en vencer es CE-4492, el 30 de septiembre.',
  'Quedan 3 anticipos sin legalizar, por $3.930.000 en total. CE-4492 vence primero, el 30 de septiembre.',
];
export const DEMO_SUGGESTIONS = [
  { title: 'Resume', label: 'los anticipos pendientes', prompt: 'Resume los anticipos pendientes' },
  { title: '¿Qué vence', label: 'esta semana?', prompt: '¿Qué vence esta semana?' },
  { title: 'Explica', label: 'la retención en la fuente', prompt: 'Explica la retención en la fuente' },
  { title: 'Concilia', label: 'la cuenta 1110', prompt: 'Concilia la cuenta 1110' },
];
const FOLLOWUPS = ['¿Cuál vence primero?', 'Envía el recordatorio'];
const DAY = 86_400_000;
type RemoteThreadMetadata = Awaited<ReturnType<RemoteThreadListAdapter['fetch']>>;
/** Hilos de los tableros «Thread list» y «Thread list sidebar», con su conversación. */
const SEED: Array<{ id: string; title: string; ago: number; q: string; a: string }> = [
  { id: 't1', title: 'Anticipos pendientes', ago: 0, q: '¿Qué anticipos siguen pendientes?', a: 'Tres, por $3.930.000. CE-4492 vence primero, el 30 de septiembre.' },
  { id: 't2', title: 'Cierre de septiembre', ago: 0.1, q: '¿Qué falta para cerrar septiembre?', a: 'Dos movimientos sin pareja en la cuenta 1110. Cuando se concilien, el periodo puede cerrarse.' },
  { id: 't3', title: 'Retención en la fuente', ago: 1, q: '¿Cómo se calcula la retención?', a: 'Base gravable antes de IVA por la tarifa del concepto.' },
  { id: 't4', title: 'Conciliación de agosto', ago: 9, q: 'Concilia el extracto de agosto', a: 'Concilié 42 movimientos; quedan 2 sin pareja.' },
];
/** Streaming del tablero: 4 caracteres cada 30 ms. */
const STEP = 4;
const TICK_MS = 30;

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function makeModel(): ChatModelAdapter {
  let turn = 0;
  return {
    async *run({ abortSignal }) {
      const full = DEMO_ANSWERS[turn++ % DEMO_ANSWERS.length];
      for (let n = STEP; n < full.length + STEP; n += STEP) {
        if (abortSignal.aborted) return;
        await wait(TICK_MS);
        yield { content: [{ type: 'text', text: full.slice(0, n) }] };
      }
    },
  };
}
const suggestionAdapter: SuggestionAdapter = { async generate() { return FOLLOWUPS.map((prompt) => ({ prompt })); } };
const attachments = new CompositeAttachmentAdapter([new SimpleImageAttachmentAdapter(), new SimpleTextAttachmentAdapter()]);

/** Voz simulada: conecta en 1,2 s, escucha y responde en turnos de 3 s, con volumen vivo. */
const voiceAdapter: RealtimeVoiceAdapter = {
  connect: (options) => createVoiceSession(options, async (h) => {
    let muted = false;
    let t = 0;
    await wait(1200);
    if (h.isDisposed()) return { disconnect: () => undefined, mute: () => undefined, unmute: () => undefined };
    h.setStatus({ type: 'running' });
    h.emitMode('listening');
    const tick = window.setInterval(() => {
      t += 1;
      const speaking = Math.floor(t / 33) % 2 === 1;
      h.emitMode(speaking ? 'speaking' : 'listening');
      h.emitVolume(muted ? 0 : speaking ? 0.35 + 0.55 * Math.abs(Math.sin(t * 0.7) * Math.cos(t * 0.23)) : 0.15 * Math.abs(Math.sin(t * 0.4)));
    }, 90);
    return {
      disconnect: () => { window.clearInterval(tick); h.end('finished'); },
      mute: () => { muted = true; },
      unmute: () => { muted = false; },
    };
  }),
};

function makeThreadList(seed: boolean): RemoteThreadListAdapter & { messages: Map<string, { q: string; a: string }> } {
  const now = Date.now();
  const threads = new Map<string, RemoteThreadMetadata>();
  const messages = new Map<string, { q: string; a: string }>();
  if (seed) {
    SEED.forEach((s) => {
      threads.set(s.id, { status: 'regular', remoteId: s.id, title: s.title, lastMessageAt: new Date(now - s.ago * DAY) });
      messages.set(s.id, { q: s.q, a: s.a });
    });
  }
  const set = (id: string, patch: Partial<RemoteThreadMetadata>) => { const cur = threads.get(id); if (cur) threads.set(id, { ...cur, ...patch }); };
  return {
    messages,
    async list() { return { threads: [...threads.values()] }; },
    async rename(id, title) { set(id, { title }); },
    async archive(id) { set(id, { status: 'archived' }); },
    async unarchive(id) { set(id, { status: 'regular' }); },
    async delete(id) { threads.delete(id); },
    async initialize(threadId) { threads.set(threadId, { status: 'regular', remoteId: threadId, lastMessageAt: new Date() }); return { remoteId: threadId, externalId: undefined }; },
    async generateTitle(remoteId, msgs) {
      const first = msgs.find((m) => m.role === 'user');
      const text = first?.content.map((c) => (c.type === 'text' ? c.text : '')).join(' ').trim() ?? '';
      const title = text.length > 40 ? `${text.slice(0, 40)}…` : text;
      set(remoteId, { title, lastMessageAt: new Date() });
      return new ReadableStream({ start(controller) { controller.close(); } }) as never;
    },
    async fetch(threadId) { const t = threads.get(threadId); if (!t) throw new Error(`No existe el hilo ${threadId}`); return t; },
  };
}

function useSeededHistory(messages: Map<string, { q: string; a: string }>): ThreadHistoryAdapter {
  // El adaptador debe ser estable (la guía de assistant-ui): el cliente se lee en cada llamada, no al montar.
  const aui = useAui();
  const auiRef = React.useRef(aui);
  auiRef.current = aui;
  return React.useMemo<ThreadHistoryAdapter>(() => ({
    async load() {
      const item = (auiRef.current as unknown as { threadListItem: () => { getState: () => { remoteId?: string } } }).threadListItem();
      const seed = item.getState().remoteId ? messages.get(item.getState().remoteId as string) : undefined;
      if (!seed) return { messages: [] };
      return ExportedMessageRepository.fromArray([
        { role: 'user', content: seed.q },
        { role: 'assistant', content: seed.a },
      ]);
    },
    async append() { /* en memoria: el runtime ya guarda la conversación viva */ },
  }), [messages]);
}

export function AuiDemoRuntime({ children, seed = false, voice = false }: { children: React.ReactNode; seed?: boolean; voice?: boolean }) {
  const list = React.useMemo(() => makeThreadList(seed), [seed]);
  const model = React.useMemo(makeModel, []);
  const adapter = React.useMemo<RemoteThreadListAdapter>(() => ({
    ...list,
    unstable_useAdapters: function useDemoAdapters() {
      const history = useSeededHistory(list.messages);
      return React.useMemo(() => ({ history, attachments }), [history]);
    },
  }), [list]);
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: function useDemoThreadRuntime() {
      return useLocalRuntime(model, { adapters: { suggestion: suggestionAdapter, attachments, ...(voice ? { voice: voiceAdapter } : {}) } });
    },
    adapter,
  });
  const config = React.useMemo(() => AuiConfig({ suggestions: Suggestions(DEMO_SUGGESTIONS) }), []);
  return <AssistantRuntimeProvider runtime={runtime} config={config}>{children}</AssistantRuntimeProvider>;
}
