// La plantilla «Obligaciones con asistente flotante»: la pantalla con la burbuja del Assistant modal abajo a la
// derecha; abre el hilo en un panel que se redimensiona, con la lista de chats y «Nuevo hilo» en el encabezado. La
// selección de la tabla viaja como contexto.
import * as React from 'react';
import Box from '@mui/material/Box';
import { AuiAssistantModal, AuiSelectionContextProvider } from '../../../src/ai/aui';
import { AuiDemoRuntime } from '../AuiDemoRuntime';
import { ObligacionesPage, SincoAppBar } from './ObligacionesPage';
import { SINCO_PREVIOUS_THREADS } from './SincoAssistant';
import { DICTATED, WELCOME_SUGGESTIONS, makeObligacionesFollowups, makeObligacionesModel, obligacionesSelection, useObligaciones, type Estado, type ObligacionesState } from './obligaciones';

export interface SincoModalProps {
  filter?: Estado | 'todas';
  selected?: number[];
  /** El panel abierto al inicio. Default false. */
  defaultOpen?: boolean;
}

export function SincoModal({ filter, selected, defaultOpen = false }: SincoModalProps) {
  const host = useObligaciones({ filter, selected });
  const bridge = React.useRef<ObligacionesState | null>(null);
  bridge.current = host;
  const model = React.useMemo(() => makeObligacionesModel(bridge), []);
  const followups = React.useMemo(() => makeObligacionesFollowups(bridge), []);
  return (
    <AuiDemoRuntime model={model} suggestions={followups} threads={SINCO_PREVIOUS_THREADS} dictation={DICTATED} welcomeSuggestions={WELCOME_SUGGESTIONS}>
      <AuiSelectionContextProvider selection={obligacionesSelection(host)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', containerType: 'inline-size', bgcolor: 'background.default', color: 'text.primary' }}>
          <SincoAppBar />
          {/* La burbuja y el panel se anclan a la pantalla (no a la ventana), y el panel no crece más que ella. */}
          <Box sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', transform: 'translateZ(0)', containerType: 'size' }}>
            <Box sx={{ height: '100%', overflow: 'auto' }}><ObligacionesPage state={host} askAi={false} /></Box>
            <AuiAssistantModal position="absolute" defaultOpen={defaultOpen} />
          </Box>
        </Box>
      </AuiSelectionContextProvider>
    </AuiDemoRuntime>
  );
}
