import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RotateCcw } from 'lucide-react';
import { ScrollAnchor, type ScrollAnchorMessage } from '../../src/ai/scroll-anchor';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Scroll anchor».
const LINES: ScrollAnchorMessage[] = [
  { role: 'user', text: 'Ve resumiendo el cierre de agosto a medida que avanzas.' },
  { role: 'assistant', text: 'Empiezo ahora.' },
  { role: 'assistant', text: 'Bancos: 42 movimientos conciliados, 2 sin pareja.' },
  { role: 'assistant', text: 'Anticipos: 11 legalizados, 1 pendiente (CE-4410).' },
  { role: 'assistant', text: 'Cuentas por pagar: 38 facturas causadas, ninguna vencida.' },
  { role: 'assistant', text: 'Nómina: provisiones de agosto registradas.' },
  { role: 'assistant', text: 'Impuestos: retención en la fuente lista para declarar.' },
  { role: 'assistant', text: 'Activos: depreciación del mes calculada.' },
  { role: 'assistant', text: 'Listo. El periodo puede cerrarse después de revisar los 2 movimientos sin pareja.' },
];

export function ScrollAnchorDoc() {
  const [paused, setPaused] = React.useState<'false' | 'true'>('false');
  const [key, setKey] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <ScrollAnchor key={key} messages={LINES} paused={paused === 'true'} />
          </Box>
        }
        properties={
          <>
            <PropRow label="paused"><PropToggle<'false' | 'true'> label="paused" value={paused} onChange={setPaused} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setKey((k) => k + 1)}>Reset</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function ScrollAnchorCard() {
  const [key, setKey] = React.useState(0);
  const onSettled = React.useCallback(() => { window.setTimeout(() => setKey((k) => k + 1), 3000); }, []);
  return <ScrollAnchor key={key} messages={LINES} onSettled={onSettled} sx={{ height: 212 }} />;
}
