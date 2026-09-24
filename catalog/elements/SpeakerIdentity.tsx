import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RotateCcw } from 'lucide-react';
import { SpeakerIdentity } from '../../src/ai/speaker-identity';
import type { SpeakerTurn } from '../../src/ai/speaker-identity';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Speaker identity».
const TURNS: SpeakerTurn[] = [
  { id: 't1', kind: 'user', name: 'Carlos', text: '¿Por qué CE-4471 quedó en el centro de costo equivocado?' },
  { id: 't2', kind: 'agent', name: 'Asistente Sinco', detail: 'Cosmos · 4,2 s', text: 'Lo reviso con el agente contable y el historial del anticipo.' },
  { id: 't3', kind: 'tool', name: 'consultar_historial', detail: '1,1 s', text: '{ "id": "CE-4471", "cambios": 2 }' },
  { id: 't4', kind: 'subagent', name: 'Agente contable', detail: '2,6 s', text: 'El 3 de septiembre se copió el centro de costo de la orden de compra, no el del proyecto.' },
  { id: 't5', kind: 'agent', name: 'Asistente Sinco', detail: 'Cosmos · 1,8 s', text: 'La causa fue la copia automática desde la orden de compra. Te propongo corregirlo.' },
  { id: 't6', kind: 'user', name: 'Carlos', text: 'Hazlo, y avísale a Nubia.' },
];
const START = 4;

type Filter = 'all' | 'no-tools';

export function SpeakerIdentityDoc() {
  const [count, setCount] = React.useState(START);
  const [filter, setFilter] = React.useState<Filter>('all');
  const turns = TURNS.slice(0, count).filter((turn) => filter === 'all' || turn.kind !== 'tool');

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={
          <Box sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <SpeakerIdentity turns={turns} />
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="Filter">
              <PropToggle<Filter> label="Filter" value={filter} onChange={setFilter} options={[['all', 'all'], ['no-tools', 'no tools']]} />
            </PropRow>
            <PropRow label="turns">
              <Button variant="contained" disabled={count >= TURNS.length} onClick={() => setCount((c) => Math.min(c + 1, TURNS.length))}>Add turn</Button>
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setCount(START)}>Reset</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function SpeakerIdentityCard() {
  return <Box sx={{ width: '100%' }}><SpeakerIdentity turns={TURNS.slice(0, 3)} /></Box>;
}
