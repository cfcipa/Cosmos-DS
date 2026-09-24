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
  useAuiState,
  useLocalRuntime,
  useRemoteThreadListRuntime,
  type ChatModelAdapter,
  type RealtimeVoiceAdapter,
  type RemoteThreadListAdapter,
  type SuggestionAdapter,
  type ThreadHistoryAdapter,
  type AttachmentAdapter,
  type PendingAttachment,
  type ThreadMessage,
  type ThreadMessageLike,
} from '@assistant-ui/react';
import { demoMcpManager, installMockMcp } from './mcpDemo';

// Runtime de las demos AUI connected: el mismo @assistant-ui/react de producción, con un modelo de ejemplo, una lista
// de hilos en memoria (sembrada con los hilos del tablero) y una sesión de voz simulada.
export const DEMO_ANSWERS = [
  'Hay 3 anticipos pendientes por $3.930.000. El próximo en vencer es CE-4492, el 30 de septiembre.',
  'Quedan **3 anticipos** sin legalizar, por $3.930.000 en total:\n\n| Anticipo | Responsable | Vence |\n| --- | --- | --- |\n| CE-4492 | Nubia Rojas | 30 sep |\n| CE-4480 | Andrés Gil | 8 oct |\n| CE-4471 | Nicolás Pardo | 15 oct |\n\nPara recordarle a Nubia, usa `recordar_anticipo`.',
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
/** El razonamiento del tablero «Reasoning». */
export const DEMO_REASONING = 'La pregunta es cuál anticipo vence primero.\n\nConsulto los anticipos pendientes: CE-4471, CE-4480 y CE-4492.\n\nFechas de vencimiento: CE-4471 el 15 de octubre, CE-4480 el 8 de octubre, CE-4492 el 30 de septiembre.\n\nOrdeno de la más cercana a la más lejana. El primero es CE-4492.\n\nVerifico el responsable: Nubia Rojas, por gastos de viaje.\n\nRespondo con el anticipo, el responsable y la fecha.';
/** Streaming del tablero: 4 caracteres cada 30 ms, tras ~320 ms hasta el primer token; el razonamiento va de a 2. */
const STEP = 4;
const REASONING_STEP = 2;
const TICK_MS = 30;
const FIRST_TOKEN_MS = 320;
const CHARS_PER_TOKEN = 4;
/** Uso de contexto de ejemplo: una base y lo que suma cada turno (tablero «Context display»). */
const USAGE_BASE = { inputTokens: 23600, cachedInputTokens: 20100, outputTokens: 7200, reasoningTokens: 2900 };
const USAGE_TURN = { inputTokens: 3200, cachedInputTokens: 3900, outputTokens: 1500, reasoningTokens: 400 };

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function usageFor(messages: readonly ThreadMessage[], reasoning: boolean) {
  const turns = messages.filter((m) => m.role === 'user').length - 1;
  const add = (k: keyof typeof USAGE_BASE) => USAGE_BASE[k] + USAGE_TURN[k] * Math.max(0, turns);
  return { inputTokens: add('inputTokens'), cachedInputTokens: add('cachedInputTokens'), outputTokens: add('outputTokens'), reasoningTokens: reasoning ? add('reasoningTokens') : 0 };
}

function makeModel(reasoning: boolean): ChatModelAdapter {
  let turn = 0;
  return {
    async *run({ abortSignal, messages }) {
      const full = DEMO_ANSWERS[turn++ % DEMO_ANSWERS.length];
      const start = Date.now();
      let firstTokenTime: number | undefined;
      let chunks = 0;
      let length = 0;
      const timing = (done: boolean) => {
        const total = Date.now() - start;
        const tokenCount = Math.ceil(length / CHARS_PER_TOKEN);
        const generating = firstTokenTime === undefined ? 0 : (total - firstTokenTime) / 1000;
        return {
          streamStartTime: start, firstTokenTime, totalChunks: chunks, toolCallCount: 0, tokenCount,
          ...(generating > 0 ? { tokensPerSecond: tokenCount / generating } : {}),
          ...(done ? { totalStreamTime: total } : {}),
        };
      };
      const tick = async () => {
        await wait(TICK_MS);
        chunks += 1;
        if (firstTokenTime === undefined) firstTokenTime = Date.now() - start;
      };
      await wait(FIRST_TOKEN_MS);
      if (reasoning) {
        for (let n = REASONING_STEP; n < DEMO_REASONING.length + REASONING_STEP; n += REASONING_STEP) {
          if (abortSignal.aborted) return;
          await tick();
          length = Math.min(n, DEMO_REASONING.length);
          yield { content: [{ type: 'reasoning', text: DEMO_REASONING.slice(0, n) }], metadata: { timing: timing(false) } };
        }
      }
      const head = reasoning ? [{ type: 'reasoning' as const, text: DEMO_REASONING }] : [];
      for (let n = STEP; n < full.length + STEP; n += STEP) {
        if (abortSignal.aborted) return;
        await tick();
        length = (reasoning ? DEMO_REASONING.length : 0) + Math.min(n, full.length);
        const done = n >= full.length;
        yield {
          content: [...head, { type: 'text', text: full.slice(0, n) }],
          metadata: { timing: timing(done), ...(done ? { custom: { usage: usageFor(messages, reasoning) } } : {}) },
        };
      }
    },
  };
}
const suggestionAdapter: SuggestionAdapter = { async generate() { return FOLLOWUPS.map((prompt) => ({ prompt })); } };
/** Documentos de ejemplo (PDF): se adjuntan con su nombre; el modelo de la demo no los lee. */
const documentAdapter: AttachmentAdapter = {
  accept: 'application/pdf',
  async add({ file }) {
    return { id: `${file.name}-${Date.now()}`, type: 'document', name: file.name, contentType: file.type, file, status: { type: 'requires-action', reason: 'composer-send' } };
  },
  async remove() { /* nada que liberar */ },
  async send(a) { return { ...a, status: { type: 'complete' }, content: [{ type: 'text', text: `[${a.name}]` }] }; },
};
const attachments = new CompositeAttachmentAdapter([new SimpleImageAttachmentAdapter(), new SimpleTextAttachmentAdapter(), documentAdapter]);

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

/** Un hilo sembrado con su conversación. */
export type DemoThread = { id: string; title: string; ago?: number; messages: ThreadMessageLike[] };
const SEED_THREADS: DemoThread[] = SEED.map((s) => ({ id: s.id, title: s.title, ago: s.ago, messages: [{ role: 'user', content: s.q }, { role: 'assistant', content: s.a }] }));

function makeThreadList(seeded: DemoThread[]): RemoteThreadListAdapter & { messages: Map<string, ThreadMessageLike[]> } {
  const now = Date.now();
  const threads = new Map<string, RemoteThreadMetadata>();
  const messages = new Map<string, ThreadMessageLike[]>();
  seeded.forEach((s) => {
    threads.set(s.id, { status: 'regular', remoteId: s.id, title: s.title, lastMessageAt: new Date(now - (s.ago ?? 0) * DAY) });
    messages.set(s.id, s.messages);
  });
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

function useSeededHistory(messages: Map<string, ThreadMessageLike[]>): ThreadHistoryAdapter {
  // El adaptador debe ser estable (la guía de assistant-ui): el cliente se lee en cada llamada, no al montar.
  const aui = useAui();
  const auiRef = React.useRef(aui);
  auiRef.current = aui;
  return React.useMemo<ThreadHistoryAdapter>(() => ({
    async load() {
      const item = (auiRef.current as unknown as { threadListItem: () => { getState: () => { remoteId?: string } } }).threadListItem();
      const seed = item.getState().remoteId ? messages.get(item.getState().remoteId as string) : undefined;
      if (!seed) return { messages: [] };
      return ExportedMessageRepository.fromArray(seed);
    },
    async append() { /* en memoria: el runtime ya guarda la conversación viva */ },
  }), [messages]);
}

export interface AuiDemoRuntimeProps {
  children: React.ReactNode;
  /** Siembra los hilos de los tableros de lista de hilos. */
  seed?: boolean;
  voice?: boolean;
  /** Las respuestas razonan antes de contestar. */
  reasoning?: boolean;
  /** Monta el administrador MCP con los servidores de ejemplo. */
  mcp?: boolean;
  /** Hilos propios de la demo (además de los de `seed`). */
  threads?: DemoThread[];
  /** Abre este hilo al montar. */
  startIn?: string;
  /** Los adjuntos tardan en subir; `failNextUpload()` hace fallar la siguiente subida. */
  slowUploads?: boolean;
}

/** Subida de ejemplo: 1,8 s en curso y luego lista (o fallida, si se pidió). */
const UPLOAD_MS = 1800;
let failNext = false;
export function failNextUpload() { failNext = true; }
const UPLOAD_ERROR = 'No se pudo subir el archivo.';
function slowAttachments(inner: AttachmentAdapter): AttachmentAdapter {
  return {
    accept: inner.accept,
    async *add({ file }) {
      const base = await inner.add({ file }) as PendingAttachment;
      yield { ...base, status: { type: 'running', reason: 'uploading', progress: 0 } };
      const fail = failNext;
      failNext = false;
      await wait(UPLOAD_MS);
      if (fail) {
        yield { ...base, status: { type: 'incomplete', reason: 'error', message: UPLOAD_ERROR } as unknown as PendingAttachment['status'] };
        return;
      }
      yield { ...base, status: { type: 'requires-action', reason: 'composer-send' } };
    },
    remove: (a) => inner.remove(a),
    send: (a, o) => inner.send(a, o),
  };
}

function StartIn({ id }: { id: string }) {
  const aui = useAui();
  const done = React.useRef(false);
  const loaded = useAuiState((st) => !st.threads.isLoading);
  React.useEffect(() => {
    if (done.current || !loaded) return;
    done.current = true;
    void (aui as unknown as { threads: () => { switchToThread: (id: string) => Promise<void> } }).threads().switchToThread(id);
  }, [aui, id, loaded]);
  return null;
}

export function AuiDemoRuntime(props: AuiDemoRuntimeProps) {
  // El administrador MCP (react-mcp 0.1.20) entra en un ciclo de actualizaciones si se monta en el mismo commit que
  // dispara un evento del navegador (p. ej. al navegar por hash); montado desde un efecto no pasa.
  const [ready, setReady] = React.useState(!props.mcp);
  React.useEffect(() => { setReady(true); }, []);
  return ready ? <DemoRuntime {...props} /> : null;
}

function DemoRuntime({ children, seed = false, voice = false, reasoning = false, mcp = false, threads, startIn, slowUploads = false }: AuiDemoRuntimeProps) {
  const list = React.useMemo(() => makeThreadList([...(seed ? SEED_THREADS : []), ...(threads ?? [])]), [seed, threads]);
  const uploads = React.useMemo(() => (slowUploads ? slowAttachments(attachments) : attachments), [slowUploads]);
  const model = React.useMemo(() => makeModel(reasoning), [reasoning]);
  if (mcp) installMockMcp();
  const adapter = React.useMemo<RemoteThreadListAdapter>(() => ({
    ...list,
    unstable_useAdapters: function useDemoAdapters() {
      const history = useSeededHistory(list.messages);
      return React.useMemo(() => ({ history, attachments: uploads }), [history]);
    },
  }), [list, uploads]);
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: function useDemoThreadRuntime() {
      return useLocalRuntime(model, { adapters: { suggestion: suggestionAdapter, attachments: uploads, ...(voice ? { voice: voiceAdapter } : {}) } });
    },
    adapter,
  });
  const config = React.useMemo(() => AuiConfig({ suggestions: Suggestions(DEMO_SUGGESTIONS), ...(mcp ? { mcp: demoMcpManager() } : {}) }), [mcp]);
  return <AssistantRuntimeProvider runtime={runtime} config={config}>{startIn ? <StartIn id={startIn} /> : null}{children}</AssistantRuntimeProvider>;
}
