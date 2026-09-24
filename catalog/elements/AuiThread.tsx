import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAuiState } from '@assistant-ui/react';
import { RotateCcw } from 'lucide-react';
import { AuiThread } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow } from '../ui/Playground';

function RunningState() {
  const running = useAuiState((s) => s.thread.isRunning);
  return <Typography variant="body3" color="text.secondary" sx={(t) => t.aiKit.code}>{String(running)}</Typography>;
}

export function AuiThreadDoc() {
  const [key, setKey] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime key={key}>
        <ElementPage
          demoHeight={440}
          demo={<Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}><Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}><AuiThread autoFocus={false} /></Box></Box>}
          properties={
            <>
              <PropRow label="Demo"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setKey((k) => k + 1)}>Empty thread</Button></PropRow>
              <PropRow label="isRunning"><RunningState /></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiThreadCard() {
  return (
    <AuiDemoRuntime>
      <Box sx={{ height: 212, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <AuiThread autoFocus={false} />
      </Box>
    </AuiDemoRuntime>
  );
}
