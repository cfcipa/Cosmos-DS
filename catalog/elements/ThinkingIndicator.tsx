import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { ThinkingIndicator, formatThinkingElapsed } from '../../src/ai/thinking-indicator';
import type { ThinkingIndicatorAnimation } from '../../src/ai/thinking-indicator';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Secuencia del tablero aprobado «Thinking indicator».
const SEQ: Array<[number, string | null]> = [[1600, 'Running consultar_anticipos'], [3400, 'Running consultar_vencimientos'], [5000, 'Thinking'], [6400, null]];
const MANUAL = ['Thinking', 'Running buscar_anticipo', 'Writing response'];

function Scene({ animation, label, elapsed, answered }: { animation: ThinkingIndicatorAnimation; label: string; elapsed?: string; answered: boolean }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ alignSelf: 'flex-end', maxWidth: 320, px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText', fontSize: 15, lineHeight: '22px' }}>
          ¿Cuáles anticipos vencen este mes?
        </Box>
        {answered
          ? <Typography sx={{ m: 0, fontSize: 15, lineHeight: '24px' }}>Vence uno: CE-4492, de Nubia Rojas, el 30 de septiembre. Los otros dos vencen en octubre.</Typography>
          : <ThinkingIndicator animation={animation} label={label} elapsed={elapsed} />}
      </Stack>
    </Box>
  );
}

export function ThinkingIndicatorDoc() {
  const [animation, setAnimation] = React.useState<ThinkingIndicatorAnimation>('boost');
  const [label, setLabel] = React.useState('Thinking');
  const [mode, setMode] = React.useState<'sim' | 'manual'>('sim');
  const [ms, setMs] = React.useState(0);
  const [showElapsed, setShowElapsed] = React.useState(true);
  const [answered, setAnswered] = React.useState(false);
  const timers = React.useRef<number[]>([]);
  const clock = React.useRef<number>();
  const stop = () => { window.clearInterval(clock.current); timers.current.forEach(clearTimeout); timers.current = []; };
  const startClock = () => { const t0 = Date.now(); window.clearInterval(clock.current); clock.current = window.setInterval(() => setMs(Date.now() - t0), 200); };

  const run = React.useCallback(() => {
    stop(); setMode('sim'); setAnswered(false); setMs(0); setLabel('Thinking'); startClock();
    SEQ.forEach(([at, l]) => timers.current.push(window.setTimeout(() => {
      if (l === null) { window.clearInterval(clock.current); setAnswered(true); } else setLabel(l);
    }, at)));
  }, []);
  React.useEffect(() => { run(); return stop; }, [run]);
  const manual = (l: string) => { stop(); setMode('manual'); setAnswered(false); setMs(0); setLabel(l); startClock(); };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={280}
        demo={<Scene animation={animation} label={label} elapsed={showElapsed ? formatThinkingElapsed(ms) : undefined} answered={answered} />}
        properties={
          <>
            <PropRow label="Simulation">
              <Button variant="contained" startIcon={<RotateCcw size={16} />} onClick={run}>Replay run</Button>
            </PropRow>
            <PropRow label="animation">
              <PropToggle<ThinkingIndicatorAnimation> label="Animation" value={animation} onChange={setAnimation} options={[['boost', 'boost'], ['pulse', 'pulse']]} />
            </PropRow>
            <PropRow label="label">
              <PropToggle<string> label="Manual label" value={mode === 'manual' ? label : ''} onChange={manual} options={MANUAL.map((l) => [l, l] as [string, string])} />
            </PropRow>
            <PropRow label="elapsed">
              <PropToggle<'on' | 'off'> label="Elapsed time" value={showElapsed ? 'on' : 'off'} onChange={(v) => setShowElapsed(v === 'on')} options={[['on', 'true'], ['off', 'false']]} />
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function ThinkingIndicatorCard() {
  const [ms, setMs] = React.useState(0);
  React.useEffect(() => { const t0 = Date.now(); const id = window.setInterval(() => setMs(Date.now() - t0), 1000); return () => clearInterval(id); }, []);
  return <ThinkingIndicator label="Running consultar_anticipos" elapsed={formatThinkingElapsed(ms)} />;
}
