import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAuiState } from '@assistant-ui/react';
import { RotateCcw } from 'lucide-react';
import { AuiThread } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

function RunningState() {
  const running = useAuiState((s) => s.thread.isRunning);
  return <Typography variant="body3" color="text.secondary" sx={(t) => t.aiKit.code}>{String(running)}</Typography>;
}

type Timing = 'off' | 'badge' | 'footer';
type MapSide = 'off' | 'left' | 'right';
/** Ventana de contexto de la demo, en tokens. */
const DEMO_WINDOW = 128_000;

export function AuiThreadDoc() {
  const [key, setKey] = React.useState(0);
  const [reasoning, setReasoning] = React.useState<'off' | 'on'>('off');
  const [timing, setTiming] = React.useState<Timing>('off');
  const [context, setContext] = React.useState<'off' | 'on'>('off');
  const [map, setMap] = React.useState<MapSide>('off');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime key={`${key}-${reasoning}`} reasoning={reasoning === 'on'}>
        <ElementPage
          demoHeight={440}
          demo={
            <Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}>
              <Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <AuiThread
                  autoFocus={false}
                  messageTiming={timing === 'off' ? false : { design: timing }}
                  modelContextWindow={context === 'on' ? DEMO_WINDOW : undefined}
                  conversationMap={map === 'off' ? false : map}
                />
              </Box>
            </Box>
          }
          properties={
            <>
              <PropRow label="reasoning"><PropToggle label="reasoning" value={reasoning} onChange={setReasoning} options={[['off', 'off'], ['on', 'on']]} /></PropRow>
              <PropRow label="messageTiming"><PropToggle<Timing> label="messageTiming" value={timing} onChange={setTiming} options={[['off', 'off'], ['badge', 'badge'], ['footer', 'footer']]} /></PropRow>
              <PropRow label="modelContextWindow"><PropToggle label="modelContextWindow" value={context} onChange={setContext} options={[['off', 'none'], ['on', '128000']]} /></PropRow>
              <PropRow label="conversationMap"><PropToggle<MapSide> label="conversationMap" value={map} onChange={setMap} options={[['off', 'off'], ['left', 'left'], ['right', 'right']]} /></PropRow>
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
