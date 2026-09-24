import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MobileComposer } from '../../src/ai/mobile-composer';
import { riseSx, userBubbleSx } from '../../src/ai/lib/thread';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido y tiempos del tablero «Mobile composer».
const ACTIONS = ['Resumir', 'Explicar', 'Conciliar'];
const RUN_MS = 2000;
/** El teléfono del tablero: 260 × 360, marco de 8px, radio 28, teclado de 96px con 3 filas de 10 teclas. */
const PHONE = { width: 260, height: 360, frame: 1, radius: 3.5, keyboard: 12, keys: 30 };

function PhoneDemo({ connected = true, kb, setKb, onLog }: { connected?: boolean; kb: boolean; setKb: (v: boolean) => void; onLog?: (s: string) => void }) {
  const [text, setText] = React.useState('');
  const [msgs, setMsgs] = React.useState<string[]>([]);
  const [running, setRunning] = React.useState(false);
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  const send = () => {
    setMsgs((m) => [...m, text.trim()].slice(-3)); setText(''); setRunning(true); onLog?.('onSend()');
    window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setRunning(false), RUN_MS);
  };
  return (
    <Box sx={(t) => ({ width: PHONE.width, height: PHONE.height, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', border: `${t.spacing(PHONE.frame)} solid ${t.palette.text.primary}`, borderRadius: PHONE.radius, bgcolor: 'background.default', overflow: 'hidden' })}>
      <Box sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1, overflow: 'hidden' }}>
        {msgs.map((m, i) => <Typography key={`${i}-${m}`} variant="body1" component="div" sx={(t) => ({ ...userBubbleSx(), ...riseSx(t) })}>{m}</Typography>)}
      </Box>
      <MobileComposer
        value={text}
        keyboardOpen={kb}
        running={running}
        actions={ACTIONS}
        onValueChange={setText}
        onFocus={() => setKb(true)}
        onBlur={() => setKb(false)}
        onAction={connected ? (a) => { setText(`${a} `); onLog?.(`onAction("${a}")`); } : undefined}
        onAttach={connected ? () => onLog?.('onAttach(): abre el selector de archivos') : undefined}
        onSend={connected ? send : undefined}
        onStop={connected ? () => { window.clearTimeout(timer.current); setRunning(false); onLog?.('onStop()'); } : undefined}
        sx={{ flexShrink: 0 }}
      />
      {kb ? (
        <Box aria-hidden="true" sx={(t) => ({ height: t.spacing(PHONE.keyboard), flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: '3px', p: 0.75, bgcolor: 'action.selected' })}>
          {Array.from({ length: PHONE.keys }, (_, i) => <Box key={i} sx={{ borderRadius: 0.5, bgcolor: 'background.paper' }} />)}
        </Box>
      ) : null}
    </Box>
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
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><PhoneDemo connected={cb === 'on'} kb={kb} setKb={setKb} onLog={setLog} /></Box>}
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
  const scale = 0.58;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: PHONE.width * scale, height: PHONE.height * scale }}>
        <Box sx={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}><PhoneDemo kb={kb} setKb={setKb} /></Box>
      </Box>
    </Box>
  );
}
