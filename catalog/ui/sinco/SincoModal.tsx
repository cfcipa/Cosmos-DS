// La plantilla «Obligaciones con asistente flotante»: la pantalla con la burbuja del Assistant modal abajo a la
// derecha; abre el hilo en un panel que se redimensiona, con la lista de chats y «Nuevo hilo» en el encabezado. La
// selección de la tabla viaja como contexto.
import * as React from 'react';
import Box from '@mui/material/Box';
import { AuiAssistantModal } from '../../../src/ai/aui';
import { SINCO_PREVIOUS_THREADS } from './SincoAssistant';
import { SincoHost, SincoPage, useSincoHost } from './SincoHost';
import type { Estado } from './obligaciones';

export interface SincoModalProps {
  filter?: Estado | 'todas';
  selected?: number[];
  /** El panel abierto al inicio. Default false. */
  defaultOpen?: boolean;
}

export function SincoModal({ filter, selected, defaultOpen = false }: SincoModalProps) {
  const { host, model, followups } = useSincoHost({ filter, selected });
  return (
    <SincoHost host={host} model={model} followups={followups} threads={SINCO_PREVIOUS_THREADS}>
      {/* La burbuja y el panel se anclan a la pantalla (no a la ventana), y el panel no crece más que ella. */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', transform: 'translateZ(0)', containerType: 'size' }}>
        <SincoPage state={host} askAi={false} />
        <AuiAssistantModal position="absolute" defaultOpen={defaultOpen} />
      </Box>
    </SincoHost>
  );
}
