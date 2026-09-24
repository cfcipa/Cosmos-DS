import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Launcher } from '../../src/ai/launcher';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Launcher».
const PROMPTS = ['Estado de mi anticipo', 'Hablar con una persona', '¿Cuándo es el cierre?'];
type Callbacks = 'all' | 'toggle' | 'none';
type Unread = '0' | '2' | '12';

/** La página detrás del launcher (tablero): unas líneas grises sobre la superficie de fondo. */
function PageBehind({ children, log }: { children: React.ReactNode; log?: string }) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'background.default' }}>
      <Box sx={{ position: 'absolute', left: 20, top: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {['40%', '70%', '55%'].map((w, i) => <Box key={w} sx={(t) => ({ height: t.spacing(i === 0 ? 1.75 : 1.25), width: w, borderRadius: 1, bgcolor: 'action.selected' })} />)}
      </Box>
      <Box sx={{ position: 'absolute', right: 20, bottom: 20 }}>{children}</Box>
      {log !== undefined ? <Typography variant="body3" color="text.secondary" role="status" sx={{ position: 'absolute', left: 20, bottom: 20 }}>{log}</Typography> : null}
    </Box>
  );
}

export function LauncherDoc() {
  const [open, setOpen] = React.useState(true);
  const [cb, setCb] = React.useState<Callbacks>('all');
  const [unread, setUnread] = React.useState<Unread>('2');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={
          <PageBehind log={log}>
            <Launcher
              open={open}
              unread={Number(unread)}
              greeting="¿En qué te ayudo?"
              prompts={PROMPTS}
              onToggle={cb !== 'none' ? () => setOpen((o) => !o) : undefined}
              onPick={cb === 'all' ? (p) => setLog(`onPick("${p}")`) : undefined}
              onStart={cb === 'all' ? () => setLog('onStart()') : undefined}
            />
          </PageBehind>
        }
        properties={
          <>
            <PropRow label="Callbacks"><PropToggle<Callbacks> label="Callbacks" value={cb} onChange={(v) => { setCb(v); if (v === 'none') setOpen(false); }} options={[['all', 'all'], ['toggle', 'onToggle only'], ['none', 'none']]} /></PropRow>
            <PropRow label="unread"><PropToggle<Unread> label="unread" value={unread} onChange={setUnread} options={[['0', '0'], ['2', '2'], ['12', '12']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function LauncherCard() {
  const [open, setOpen] = React.useState(false);
  return (
    <Box sx={{ position: 'relative', height: 212 }}>
      <Box sx={{ position: 'absolute', right: 0, bottom: 0, transform: 'scale(0.8)', transformOrigin: 'bottom right' }}>
        <Launcher open={open} unread={2} greeting="¿En qué te ayudo?" prompts={PROMPTS} onToggle={() => setOpen((o) => !o)} onPick={() => setOpen(false)} />
      </Box>
    </Box>
  );
}
