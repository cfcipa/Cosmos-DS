// La pantalla de Obligaciones con su asistente: el runtime de la demo con el modelo de la pantalla, la superficie del
// asistente, la selección como contexto y el panel, la píldora y la vista previa. Lo usan los tableros Sinco.
import * as React from 'react';
import { useAui } from '@assistant-ui/react';
import {
  AuiAssistantLayout, AuiAssistantPanel, AuiAssistantProvider, AuiComposerPill, AuiResponsePreview, AuiSelectionContextProvider, AuiStarterSuggestions,
  useAuiAssistant, type AuiAssistantSurface, type AuiResponsePreviewProps, type AuiStarter,
} from '../../../src/ai/aui';
import { AuiDemoRuntime, type DemoThread } from '../AuiDemoRuntime';
import {
  AGENTS, DICTATED, ObligacionesHost, STARTERS, makeObligacionesFollowups, makeObligacionesModel, nObl, obligacionesSelection, useObligaciones,
  type Estado, type ObligacionesState,
} from './obligaciones';

export interface SincoAssistantDemoProps {
  surface?: AuiAssistantSurface;
  defaultSurface?: AuiAssistantSurface;
  onSurfaceChange?: (s: AuiAssistantSurface) => void;
  threads?: DemoThread[];
  startIn?: string;
  starters?: readonly AuiStarter[];
  /** La píldora (y la vista previa) cuando el asistente está cerrado. Default true. */
  dock?: boolean;
  preview?: boolean | AuiResponsePreviewProps;
  filter?: Estado | 'todas';
  selected?: number[];
  /** Para leer o mover la pantalla desde las propiedades del tablero. */
  hostRef?: React.MutableRefObject<ObligacionesState | null>;
  /** Monta de nuevo todo (runtime incluido) cuando cambia. */
  resetKey?: React.Key;
  /** Para actuar desde las propiedades del tablero: preguntar sin abrir, abrir. */
  controlsRef?: React.MutableRefObject<SincoControls | null>;
}

export type SincoControls = { ask: (text: string) => void; open: () => void };

function Controls({ controlsRef }: { controlsRef: React.MutableRefObject<SincoControls | null> }) {
  const aui = useAui() as unknown as { thread: () => { append: (m: { role: 'user'; content: Array<{ type: 'text'; text: string }> }) => void } };
  const assistant = useAuiAssistant();
  controlsRef.current = {
    ask: (text) => aui.thread().append({ role: 'user', content: [{ type: 'text', text }] }),
    open: () => assistant?.open(),
  };
  return null;
}

/** El texto de la vista previa cuando el asistente espera una aprobación. */
export function approvalPreviewText({ toolName, args }: { toolName: string; args: unknown }) {
  const n = (args as { ids?: unknown[] }).ids?.length ?? 0;
  return `Necesito tu aprobación para ${toolName.startsWith('causar') ? 'causar' : 'confirmar'} ${nObl(n)}. Ábrelo para decidir.`;
}

function Demo({ surface, defaultSurface = 'closed', onSurfaceChange, threads, startIn, starters = STARTERS, dock = true, preview = true, filter, selected, hostRef, controlsRef }: SincoAssistantDemoProps) {
  const host = useObligaciones({ filter, selected });
  const bridge = React.useRef<ObligacionesState | null>(null);
  bridge.current = host;
  if (hostRef) hostRef.current = host;
  const model = React.useMemo(() => makeObligacionesModel(bridge), []);
  const followups = React.useMemo(() => makeObligacionesFollowups(bridge), []);
  const selection = obligacionesSelection(host);
  const previewProps = typeof preview === 'object' ? preview : {};
  return (
    <AuiDemoRuntime model={model} suggestions={followups} threads={threads} startIn={startIn} dictation={DICTATED}>
      <AuiAssistantProvider surface={surface} defaultSurface={defaultSurface} onSurfaceChange={onSurfaceChange}>
        <AuiSelectionContextProvider selection={selection}>
          {controlsRef ? <Controls controlsRef={controlsRef} /> : null}
          <AuiAssistantLayout
            panel={<AuiAssistantPanel agents={AGENTS} empty={<AuiStarterSuggestions starters={starters} />} />}
            dock={dock ? <>{preview ? <AuiResponsePreview approvalText={approvalPreviewText} {...previewProps} /> : null}<AuiComposerPill /></> : undefined}
          >
            <ObligacionesHost state={host} />
          </AuiAssistantLayout>
        </AuiSelectionContextProvider>
      </AuiAssistantProvider>
    </AuiDemoRuntime>
  );
}

export function SincoAssistantDemo({ resetKey, ...props }: SincoAssistantDemoProps) {
  return <Demo key={resetKey} {...props} />;
}
