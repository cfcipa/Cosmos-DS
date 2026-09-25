// La configuración del playground: qué hace el asistente de la plantilla «Obligaciones · Composer flotante» y qué
// piezas lleva el hilo. Solo comportamiento: el estilo es el del tema Cosmos (claro u oscuro).
import type { AuiAssistantSurface } from '../../src/ai/aui';

export type Tuck = '4000' | '8000' | 'never';
export type Quotes = 'off' | 'quote' | 'actions';
export type Timing = 'off' | 'badge' | 'footer';
export type MapSide = 'off' | 'left' | 'right';
export type Waiting = 'loader' | 'typing';

export interface PlaygroundConfig {
  assistant: {
    surface: AuiAssistantSurface;
    pill: boolean;
    preview: boolean;
    autoTuck: Tuck;
    agents: boolean;
  };
  empty: {
    starters: boolean;
    startersCount: 2 | 4;
    disclaimer: boolean;
  };
  context: {
    selection: boolean;
    askAi: boolean;
  };
  thread: {
    waiting: Waiting;
    followups: boolean;
    quotes: Quotes;
    timing: Timing;
    conversationMap: MapSide;
    contextWindow: boolean;
    modelSelector: boolean;
    mentions: boolean;
  };
  theme: 'light' | 'dark';
}

export const DEFAULT_PLAYGROUND: PlaygroundConfig = {
  assistant: { surface: 'closed', pill: true, preview: true, autoTuck: '4000', agents: true },
  empty: { starters: true, startersCount: 4, disclaimer: true },
  context: { selection: true, askAi: true },
  thread: { waiting: 'loader', followups: true, quotes: 'off', timing: 'off', conversationMap: 'off', contextWindow: false, modelSelector: false, mentions: false },
  theme: 'light',
};

/** La ventana de contexto del modelo de ejemplo, en tokens. */
export const CONTEXT_WINDOW = 128_000;

const SURFACE_LABEL: Record<AuiAssistantSurface, string> = { closed: 'closed', float: 'float', side: 'side', full: 'full' };

/** Una etiqueta con sus props, una por línea cuando hay más de una. */
function tag(name: string, props: string[], children: string[] = [], indent = ''): string[] {
  const inner = `${indent}  `;
  if (!children.length) {
    if (props.length <= 1) return [`${indent}<${name}${props.length ? ` ${props[0]}` : ''} />`];
    return [`${indent}<${name}`, ...props.map((p) => `${inner}${p}`), `${indent}/>`];
  }
  const open = props.length <= 1 ? [`${indent}<${name}${props.length ? ` ${props[0]}` : ''}>`] : [`${indent}<${name}`, ...props.map((p) => `${inner}${p}`), `${indent}>`];
  return [...open, ...children.map((c) => `${inner}${c}`), `${indent}</${name}>`];
}

/** El JSX de la plantilla con esta configuración. */
export function playgroundCode(c: PlaygroundConfig): string {
  const t = c.thread;
  const panelProps: string[] = [];
  if (c.assistant.agents) panelProps.push('agents={ASISTENTES}');
  if (!c.empty.disclaimer) panelProps.push('disclaimer=""');
  panelProps.push(c.empty.starters ? `empty={<AuiStarterSuggestions starters={INICIOS${c.empty.startersCount === 2 ? '.slice(0, 2)' : ''}} />}` : 'empty={null}');
  if (t.waiting === 'typing') panelProps.push('waiting="typing"');
  if (t.quotes !== 'off') panelProps.push(t.quotes === 'actions' ? 'quotes="actions"' : 'quotes');
  if (t.timing !== 'off') panelProps.push(t.timing === 'badge' ? 'messageTiming' : "messageTiming={{ design: 'footer' }}");
  if (t.conversationMap !== 'off') panelProps.push(t.conversationMap === 'left' ? 'conversationMap' : 'conversationMap="right"');
  if (t.contextWindow) panelProps.push(`modelContextWindow={${CONTEXT_WINDOW}}`);
  if (t.modelSelector) panelProps.push("modelSelector={{ models: MODELOS, defaultValue: 'gpt-5.6-sol' }}");
  if (t.mentions) panelProps.push('triggers={<Menciones />}', 'directives');
  const tuck = c.assistant.autoTuck === 'never' ? ['autoTuck={Infinity}'] : c.assistant.autoTuck === '8000' ? ['autoTuck={8000}'] : [];
  const dock = c.assistant.pill ? [...(c.assistant.preview ? tag('AuiResponsePreview', tuck) : []), ...tag('AuiComposerPill', [])] : [];
  const layoutProps = ['panel={panel}', ...(dock.length ? ['dock={dock}'] : [])];
  const host = tag('ObligacionesPorPagar', c.context.askAi ? [] : ['askAi={false}']);
  const layout = tag('AuiAssistantLayout', layoutProps, host);
  const body = c.context.selection ? tag('AuiSelectionContextProvider', ['selection={seleccion}'], layout) : layout;
  const provider = tag('AuiAssistantProvider', [`defaultSurface="${SURFACE_LABEL[c.assistant.surface]}"`], [...tag('SincoAppBar', []), ...body]);
  const root = tag('AssistantRuntimeProvider', ['runtime={runtime}'], provider);
  const adapters = [...(t.followups ? ['suggestion: seguimientos'] : []), 'attachments', 'dictation'].join(', ');
  return [
    `const runtime = useLocalRuntime(modelo, { adapters: { ${adapters} } });`,
    '',
    'const panel = (',
    ...tag('AuiAssistantPanel', panelProps, [], '  '),
    ');',
    ...(dock.length ? ['', 'const dock = (', '  <>', ...dock.map((l) => `    ${l}`), '  </>', ');'] : []),
    '',
    'return (',
    ...root.map((l) => `  ${l}`),
    ');',
  ].join('\n');
}
