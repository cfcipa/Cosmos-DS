// La plantilla «Obligaciones · Composer flotante» armada según la configuración del playground: el runtime de la
// demo con el modelo de la pantalla, la superficie del asistente, la selección como contexto, el AppBar y la pantalla.
import * as React from 'react';
import { unstable_useMentionAdapter, unstable_useSlashCommandAdapter, useAui, type SuggestionAdapter } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import { FileText, Filter, Landmark, Sparkles, User, Users, Wrench } from 'lucide-react';
import {
  AuiAssistantLayout, AuiAssistantPanel, AuiAssistantProvider, AuiComposerPill, AuiComposerTriggerPopover, AuiResponsePreview, AuiSelectionContextProvider,
  AuiStarterSuggestions, type AuiAssistantSurface,
} from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { approvalPreviewText } from '../ui/sinco/SincoAssistantDemo';
import { ObligacionesPage, SincoAppBar, FULL_ROWS } from '../ui/sinco/ObligacionesPage';
import { AGENTS, DICTATED, SINCO_THREADS, STARTERS, makeObligacionesFollowups, makeObligacionesModel, obligacionesSelection, useObligaciones, type ObligacionesState } from '../ui/sinco/obligaciones';
import { DEFAULT_EFFORT, DEFAULT_MODEL, MODELS } from '../elements/AuiModelSelector';
import { CONTEXT_WINDOW, type PlaygroundConfig } from './config';

export type TemplateControls = { newChat: () => void };

/** Los chats anteriores de la plantilla (el menú de chats del panel). */
const PREVIOUS = SINCO_THREADS.slice(1);
const TUCK = { '4000': 4000, '8000': 8000, never: Number.POSITIVE_INFINITY } as const;
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
const DIRECTIVE_ICONS = { user: User, tool: Wrench };

/** @ para personas y herramientas, / para comandos. */
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

function Controls({ controlsRef }: { controlsRef: React.MutableRefObject<TemplateControls | null> }) {
  const aui = useAui() as unknown as { threads: () => { switchToNewThread: () => void } };
  controlsRef.current = { newChat: () => aui.threads().switchToNewThread() };
  return null;
}

export interface SincoTemplateProps {
  config: PlaygroundConfig;
  onSurfaceChange: (s: AuiAssistantSurface) => void;
  controlsRef: React.MutableRefObject<TemplateControls | null>;
}

export function SincoTemplate({ config: c, onSurfaceChange, controlsRef }: SincoTemplateProps) {
  const host = useObligaciones({ rows: FULL_ROWS });
  const bridge = React.useRef<ObligacionesState | null>(null);
  bridge.current = host;
  const model = React.useMemo(() => makeObligacionesModel(bridge), []);
  // Los seguimientos se apagan sin montar de nuevo el runtime.
  const followupsOn = React.useRef(c.thread.followups);
  followupsOn.current = c.thread.followups;
  const suggestions = React.useMemo<SuggestionAdapter>(() => {
    const inner = makeObligacionesFollowups(bridge);
    return { generate: (opts) => (followupsOn.current ? inner.generate(opts) : Promise.resolve([])) };
  }, []);
  const selection = c.context.selection ? obligacionesSelection(host) : null;
  const t = c.thread;
  const starters = c.empty.startersCount === 2 ? STARTERS.slice(0, 2) : STARTERS;
  const panel = (
    <AuiAssistantPanel
      agents={c.assistant.agents ? AGENTS : []}
      disclaimer={c.empty.disclaimer ? undefined : ''}
      empty={c.empty.starters ? <AuiStarterSuggestions starters={starters} /> : null}
      quotes={t.quotes === 'off' ? false : t.quotes === 'actions' ? 'actions' : true}
      messageTiming={t.timing === 'off' ? false : t.timing === 'footer' ? { design: 'footer' } : true}
      conversationMap={t.conversationMap === 'off' ? undefined : t.conversationMap}
      modelContextWindow={t.contextWindow ? CONTEXT_WINDOW : undefined}
      modelSelector={t.modelSelector ? { models: MODELS, defaultValue: DEFAULT_MODEL, defaultEffort: DEFAULT_EFFORT } : undefined}
      triggers={t.mentions ? <Mentions /> : undefined}
      directives={t.mentions ? { iconMap: DIRECTIVE_ICONS, fallbackIcon: Sparkles } : undefined}
    />
  );
  const dock = c.assistant.pill ? (
    <>
      {c.assistant.preview ? <AuiResponsePreview autoTuck={TUCK[c.assistant.autoTuck]} approvalText={approvalPreviewText} /> : null}
      <AuiComposerPill />
    </>
  ) : undefined;
  return (
    <AuiDemoRuntime model={model} suggestions={suggestions} threads={PREVIOUS} dictation={DICTATED}>
      <Controls controlsRef={controlsRef} />
      <AuiAssistantProvider surface={c.assistant.surface} onSurfaceChange={onSurfaceChange}>
        <AuiSelectionContextProvider selection={selection}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', containerType: 'inline-size', bgcolor: 'background.default', color: 'text.primary' }}>
            <SincoAppBar />
            <AuiAssistantLayout panel={panel} dock={dock} sx={{ flex: 1 }}>
              <ObligacionesPage state={host} askAi={c.context.askAi} />
            </AuiAssistantLayout>
          </Box>
        </AuiSelectionContextProvider>
      </AuiAssistantProvider>
    </AuiDemoRuntime>
  );
}
