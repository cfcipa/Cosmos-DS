import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useAui } from '@assistant-ui/react';
import { RotateCcw } from 'lucide-react';
import { AuiAssistantModal } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow } from '../ui/Playground';

/** Envía un mensaje desde fuera del modal: el runStart lo abre solo. */
function RunFromOutside() {
  const aui = useAui();
  const send = () => (aui as unknown as { thread: () => { append: (m: { role: 'user'; content: Array<{ type: 'text'; text: string }> }) => void } }).thread().append({ role: 'user', content: [{ type: 'text', text: '¿Cuánto suman los anticipos pendientes?' }] });
  return <Button variant="contained" onClick={send}>Simulate runStart from outside</Button>;
}

/** La página donde vive el modal: el contenedor con transform ancla la burbuja fija a la demo. */
function Page({ children, height }: { children: React.ReactNode; height?: number }) {
  return (
    <Box sx={{ position: 'relative', height: height ?? '100%', transform: 'translateZ(0)', overflow: 'hidden', bgcolor: 'background.default' }}>
      {children}
    </Box>
  );
}

export function AuiAssistantModalDoc() {
  const [key, setKey] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime key={key} seed>
        <ElementPage
          demoHeight={600}
          demo={<Page><AuiAssistantModal /></Page>}
          properties={
            <PropRow label="Try it">
              <RunFromOutside />
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setKey((k) => k + 1)}>Reset</Button>
            </PropRow>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiAssistantModalCard() {
  return <AuiDemoRuntime><Page height={212}><AuiAssistantModal /></Page></AuiDemoRuntime>;
}
