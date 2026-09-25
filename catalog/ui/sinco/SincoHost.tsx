// Lo que comparten las plantillas Sinco: el estado de la pantalla con su modelo de ejemplo, el runtime de demo con la
// selección de la tabla como contexto, y la pantalla misma (AppBar y Obligaciones por pagar). Cada plantilla decide
// solo dónde vive el asistente.
import * as React from 'react';
import Box from '@mui/material/Box';
import type { ChatModelAdapter, SuggestionAdapter } from '@assistant-ui/react';
import { AuiSelectionContextProvider } from '../../../src/ai/aui';
import { AuiDemoRuntime, type AuiDemoRuntimeProps } from '../AuiDemoRuntime';
import { ObligacionesPage, SincoAppBar, type ObligacionesPageProps } from './ObligacionesPage';
import { DICTATED, WELCOME_SUGGESTIONS, makeObligacionesFollowups, makeObligacionesModel, obligacionesSelection, useObligaciones, type Estado, type ObligacionesState } from './obligaciones';

export type ObligacionesBridge = React.MutableRefObject<ObligacionesState | null>;

/** La pantalla y su modelo: el estado vivo, y el modelo y los seguimientos que lo leen a través del puente. */
export function useSincoHost({ filter, selected, model: wrap }: { filter?: Estado | 'todas'; selected?: number[]; /** Envuelve el modelo de Obligaciones (p. ej. para redactar documentos). */ model?: (inner: ChatModelAdapter, bridge: ObligacionesBridge) => ChatModelAdapter } = {}) {
  const host = useObligaciones({ filter, selected });
  const bridge = React.useRef<ObligacionesState | null>(null);
  bridge.current = host;
  const model = React.useMemo(() => (wrap ? wrap(makeObligacionesModel(bridge), bridge) : makeObligacionesModel(bridge)), []);
  const followups = React.useMemo<SuggestionAdapter>(() => makeObligacionesFollowups(bridge), []);
  return { host, bridge, model, followups };
}

export interface SincoScreenProps {
  /** Acciones del AppBar antes de la empresa (p. ej. abrir el asistente). */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** La pantalla: el AppBar y, debajo, lo que la plantilla ponga. El ancho del contenedor decide la versión angosta. */
export function SincoScreen({ actions, children }: SincoScreenProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', containerType: 'inline-size', bgcolor: 'background.default', color: 'text.primary' }}>
      <SincoAppBar actions={actions} />
      {children}
    </Box>
  );
}

/** Obligaciones por pagar con su propio desplazamiento, para ponerla junto al asistente. */
export function SincoPage(props: ObligacionesPageProps) {
  return <Box sx={{ height: '100%', overflow: 'auto' }}><ObligacionesPage {...props} /></Box>;
}

export interface SincoHostProps extends Pick<AuiDemoRuntimeProps, 'threads' | 'startIn'> {
  host: ObligacionesState;
  model: ChatModelAdapter;
  followups: SuggestionAdapter;
  /** Las filas seleccionadas viajan como contexto. Default true. */
  selection?: boolean;
  /** Sugerencias del chat vacío del hilo. Default las de Obligaciones; null, las de los tableros. */
  welcomeSuggestions?: AuiDemoRuntimeProps['welcomeSuggestions'] | null;
  /** Proveedores propios de la plantilla, dentro del runtime y la selección (p. ej. el del panel del asistente). */
  providers?: (children: React.ReactNode) => React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** El anfitrión de una plantilla con runtime: la demo, la selección como contexto y la pantalla. */
export function SincoHost({ host, model, followups, threads, startIn, selection = true, welcomeSuggestions = WELCOME_SUGGESTIONS, providers = (c) => c, actions, children }: SincoHostProps) {
  return (
    <AuiDemoRuntime model={model} suggestions={followups} threads={threads} startIn={startIn} dictation={DICTATED} welcomeSuggestions={welcomeSuggestions ?? undefined}>
      <AuiSelectionContextProvider selection={selection ? obligacionesSelection(host) : null}>
        {providers(<SincoScreen actions={actions}>{children}</SincoScreen>)}
      </AuiSelectionContextProvider>
    </AuiDemoRuntime>
  );
}
