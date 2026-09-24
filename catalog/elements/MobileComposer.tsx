import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MobileComposer } from '../../src/ai/mobile-composer';
import { riseSx, userBubbleSx } from '../../src/ai/lib/thread';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Mobile composer»; la ejecución dura 2 s.
const ACTIONS = ['Resumir', 'Explicar', 'Conciliar'];
const RUN_MS = 2000;

/** La hoja al pie de la pantalla, con lo enviado encima. `keyboardOpen` sigue el foco del campo. */
function SheetDemo({ connected = true, kb, setKb, onLog }: { connected?: boolean; kb: boolean; setKb: (v: boolean) => void; onLog?: (s: string) => void }) {
  const [text, setText] = React.useState('');
  const [msgs, setMsgs] = React.useState<string[]>([]);
  const [running, setRunning] = React.useState(false);
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  const send = () => {
    setMsgs((m) => [...m, text.trim()].slice(-2)); setText(''); setRunning(true); onLog?.('onSend()');
    window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setRunning(false), RUN_MS);
  };
  return (
    <Stack justifyContent="flex-end" sx={{ height: '100%', width: '100%', maxWidth: 304, mx: 'auto' }}>
      <Stack spacing={1} sx={{ px: 1.5, pb: 1.5 }}>
        {msgs.map((m, i) => <Typography key={`${i}-${m}`} variant="body2" component="div" sx={(t) => ({ ...userBubbleSx(), ...riseSx(t) })}>{m}</Typography>)}
      </Stack>
      <MobileComposer
        value={text}
        keyboardOpen={kb}
        running={running}
        actions={ACTIONS}
        onValueChange={setText}
        onFocus={() => setKb(true)}
        onBlur={() => setKb(false)}
        onAction={connected ? (a) => { setText(a); onLog?.(`onAction("${a}")`); } : undefined}
        onAttach={connected ? () => onLog?.('onAttach(): abre el selector de archivos') : undefined}
        onSend={connected ? send : undefined}
        onStop={connected ? () => { window.clearTimeout(timer.current); setRunning(false); onLog?.('onStop()'); } : undefined}
      />
    </Stack>
  );
}

export function MobileComposerDoc() {
  const [kb, setKb] = React.useState(false);
  const [cb, setCb] = React.useState<'on' | 'off'>('on');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', px: 3, bgcolor: 'background.default' }}><SheetDemo connected={cb === 'on'} kb={kb} setKb={setKb} onLog={setLog} /></Box>}
        properties={
          <>
            <PropRow label="keyboardOpen"><PropToggle<'false' | 'true'> label="keyboardOpen" value={kb ? 'true' : 'false'} onChange={(v) => setKb(v === 'true')} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
            <PropRow label="Callbacks"><PropToggle<'on' | 'off'> label="Callbacks" value={cb} onChange={setCb} options={[['on', 'connected'], ['off', 'no callbacks']]} /></PropRow>
            <PropRow label="State"><Typography variant="body3" color="text.secondary" role="status">{log}</Typography></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function MobileComposerCard() {
  const [kb, setKb] = React.useState(false);
  return <Box sx={{ height: 212 }}><SheetDemo kb={kb} setKb={setKb} /></Box>;
}
