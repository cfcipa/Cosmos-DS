// La plantilla «Obligaciones · Composer flotante»: la pantalla de Obligaciones por pagar con su asistente. El runtime
// de la demo con el modelo de la pantalla, la superficie del asistente, la selección como contexto, el AppBar, la
// pantalla y el panel, la píldora y la vista previa. La usan los tableros Sinco del catálogo y el playground.
import * as React from 'react';
import { unstable_useMentionAdapter, unstable_useSlashCommandAdapter, useAui, type SuggestionAdapter } from '@assistant-ui/react';
import { FileText, Filter, Landmark, Sparkles, User, Users, Wrench } from 'lucide-react';
import {
  AuiAssistantLayout, AuiAssistantPanel, AuiAssistantProvider, AuiComposerPill, AuiComposerTriggerPopover, AuiResponsePreview,
  AuiStarterSuggestions, useAuiAssistant, type AuiAssistantPanelProps, type AuiAssistantSurface, type AuiResponsePreviewProps, type AuiStarter,
} from '../../../src/ai/aui';
import type { DemoThread } from '../AuiDemoRuntime';
import { ObligacionesPage } from './ObligacionesPage';
import { SincoHost, useSincoHost } from './SincoHost';
import { AGENTS, SINCO_THREADS, STARTERS, nObl, type Estado } from './obligaciones';

/** Lo que el hilo del panel lleva además de lo de siempre. */
export type SincoThreadOptions = Pick<AuiAssistantPanelProps, 'quotes' | 'messageTiming' | 'conversationMap' | 'modelContextWindow' | 'modelSelector'> & {
  /** @ para personas y herramientas, / para comandos; las menciones se ven como fichas. */
  mentions?: boolean;
};

export type SincoControls = { ask: (text: string) => void; open: () => void; newChat: () => void };

export interface SincoAssistantProps {
  surface?: AuiAssistantSurface;
  defaultSurface?: AuiAssistantSurface;
  onSurfaceChange?: (s: AuiAssistantSurface) => void;
  /** Los chats sembrados. Default: los chats anteriores del tablero. */
  threads?: DemoThread[];
  startIn?: string;
  filter?: Estado | 'todas';
  selected?: number[];
  /** Los inicios del chat vacío; null, ninguno. */
  starters?: readonly AuiStarter[] | null;
  /** El menú «Nuevo chat» con los asistentes. Default true. */
  agents?: boolean;
  /** El aviso de IA sobre el hilo. Default true. */
  disclaimer?: boolean;
  /** La píldora cuando el asistente está cerrado. Default true. */
  pill?: boolean;
  /** La vista previa sobre la píldora. Default true. */
  preview?: boolean | AuiResponsePreviewProps;
  /** Las filas seleccionadas viajan como contexto. Default true. */
  selection?: boolean;
  /** «Preguntar a la IA» en la barra de selección. Default true. */
  askAi?: boolean;
  /** Seguimientos tras cada respuesta. Default true. Cambiarlo no monta de nuevo el runtime. */
  followups?: boolean;
  thread?: SincoThreadOptions;
  /** Para actuar desde fuera: preguntar sin abrir, abrir, empezar un chat nuevo. */
  controlsRef?: React.MutableRefObject<SincoControls | null>;
  /** Monta de nuevo todo (runtime incluido) cuando cambia. */
  resetKey?: React.Key;
}

/** Los chats anteriores del tablero (sin el actual). */
export const SINCO_PREVIOUS_THREADS = SINCO_THREADS.slice(1);

/** El texto de la vista previa cuando el asistente espera una aprobación. */
export function approvalPreviewText({ toolName, args }: { toolName: string; args: unknown }) {
  const n = (args as { ids?: unknown[] }).ids?.length ?? 0;
  return `Necesito tu aprobación para ${toolName.startsWith('causar') ? 'causar' : 'confirmar'} ${nObl(n)}. Ábrelo para decidir.`;
}

const MENTION_ICONS = { personas: Users, herramientas: Wrench, user: User, wrench: Wrench, filter: Filter, 'file-text': FileText, landmark: Landmark };
const MENTIONS = [
  { id: 'personas', label: 'Personas', items: [
    { id: 'nubia', type: 'user', label: 'Nubia Rojas', description: 'Tesorería', icon: 'user' },
    { id: 'cdiaz', type: 'user', label: 'Carolina Díaz', description: 'Contabilidad', icon: 'user' }] },
  { id: 'herramientas', label: 'Herramientas', items: [
    { id: 'filtrar_obligaciones', type: 'tool', label: 'Filtrar obligaciones', description: 'Por estado y soporte', icon: 'filter' },
    { id: 'confirmar_obligaciones', type: 'tool', label: 'Confirmar obligaciones', description: 'Con tu aprobación', icon: 'wrench' }] },
];
const COMMANDS = [
  { id: 'resumir', description: 'Resume la conversación', icon: 'file-text', execute: () => undefined },
  { id: 'conciliar', description: 'Concilia la cuenta 1110', icon: 'landmark', execute: () => undefined },
];
const DIRECTIVES = { iconMap: { user: User, tool: Wrench }, fallbackIcon: Sparkles };

function Mentions() {
  const mention = unstable_useMentionAdapter({ categories: MENTIONS, includeModelContextTools: false, iconMap: MENTION_ICONS, fallbackIcon: Sparkles });
  const slash = unstable_useSlashCommandAdapter({ commands: COMMANDS, removeOnExecute: true, iconMap: MENTION_ICONS, fallbackIcon: Sparkles });
  return (
    <>
      <AuiComposerTriggerPopover char="@" {...mention} />
      <AuiComposerTriggerPopover char="/" {...slash} />
    </>
  );
}

function Controls({ controlsRef }: { controlsRef: React.MutableRefObject<SincoControls | null> }) {
  const aui = useAui() as unknown as {
    thread: () => { append: (m: { role: 'user'; content: Array<{ type: 'text'; text: string }> }) => void };
    threads: () => { switchToNewThread: () => void };
  };
  const assistant = useAuiAssistant();
  controlsRef.current = {
    ask: (text) => aui.thread().append({ role: 'user', content: [{ type: 'text', text }] }),
    open: () => assistant?.open(),
    newChat: () => aui.threads().switchToNewThread(),
  };
  return null;
}

function Template({
  surface, defaultSurface = 'closed', onSurfaceChange, threads = SINCO_PREVIOUS_THREADS, startIn, filter, selected, starters = STARTERS, agents = true, disclaimer = true,
  pill = true, preview = true, selection = true, askAi = true, followups = true, thread = {}, controlsRef,
}: Omit<SincoAssistantProps, 'resetKey'>) {
  const { host, model, followups: inner } = useSincoHost({ filter, selected });
  const followupsOn = React.useRef(followups);
  followupsOn.current = followups;
  const suggestions = React.useMemo<SuggestionAdapter>(() => ({ generate: (opts) => (followupsOn.current ? inner.generate(opts) : Promise.resolve([])) }), [inner]);
  const { mentions, ...threadProps } = thread;
  const panel = (
    <AuiAssistantPanel
      {...threadProps}
      agents={agents ? AGENTS : []}
      disclaimer={disclaimer ? undefined : ''}
      empty={starters ? <AuiStarterSuggestions starters={starters} /> : null}
      triggers={mentions ? <Mentions /> : undefined}
      directives={mentions ? DIRECTIVES : undefined}
    />
  );
  const dock = pill ? (
    <>
      {preview ? <AuiResponsePreview approvalText={approvalPreviewText} {...(typeof preview === 'object' ? preview : {})} /> : null}
      <AuiComposerPill />
    </>
  ) : undefined;
  return (
    <SincoHost
      host={host}
      model={model}
      followups={suggestions}
      threads={threads}
      startIn={startIn}
      selection={selection}
      welcomeSuggestions={null}
      providers={(children) => (
        <AuiAssistantProvider surface={surface} defaultSurface={defaultSurface} onSurfaceChange={onSurfaceChange}>
          {controlsRef ? <Controls controlsRef={controlsRef} /> : null}
          {children}
        </AuiAssistantProvider>
      )}
    >
      <AuiAssistantLayout panel={panel} dock={dock} sx={{ flex: 1 }}>
        <ObligacionesPage state={host} askAi={askAi} />
      </AuiAssistantLayout>
    </SincoHost>
  );
}

export function SincoAssistant({ resetKey, ...props }: SincoAssistantProps) {
  return <Template key={resetKey} {...props} />;
}
