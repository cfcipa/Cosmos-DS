import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RotateCcw } from 'lucide-react';
import { AuiThread, AuiThreadList } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow } from '../ui/Playground';

/** La lista junto al hilo activo, para ver el cambio de conversación. */
function ListDemo({ height }: { height?: number }) {
  return (
    <Box sx={{ display: 'flex', height: height ?? '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box sx={{ width: 232, flexShrink: 0, p: 1, overflowY: 'auto', borderRight: 1, borderColor: 'divider' }}><AuiThreadList /></Box>
      <Box sx={{ flex: 1, minWidth: 0 }}><AuiThread autoFocus={false} /></Box>
    </Box>
  );
}

export function AuiThreadListDoc() {
  const [key, setKey] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={<Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}><AuiDemoRuntime key={key} seed><ListDemo /></AuiDemoRuntime></Box>}
        properties={<PropRow label="Try it"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setKey((k) => k + 1)}>Reset</Button></PropRow>}
      />
    </Box>
  );
}

export function AuiThreadListCard() {
  return (
    <AuiDemoRuntime seed>
      <Box sx={{ height: 212, overflowY: 'auto', p: 1, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}><AuiThreadList /></Box>
    </AuiDemoRuntime>
  );
}
