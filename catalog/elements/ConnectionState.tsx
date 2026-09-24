import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { ConnectionState, type ConnectionPhase } from '../../src/ai/connection-state';
import { caretBlink } from '../../src/ai/lib/thread';
import { REDUCED_MOTION } from '../../src/ai/lib/shimmerText';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { useTimers } from '../ui/useTimers';

// Contenido y tiempos del tablero «Connection state».
const FULL = 'En septiembre se entregaron 14 anticipos por $18.450.000. Se legalizaron 11 y quedan 3 pendientes por $3.930.000. El más próximo a vencer es CE-4492, el 30 de septiembre. Recomiendo enviar recordatorio a los tres responsables esta semana.';
const STEP = 3;
const TICK_MS = 45;

/** El servidor sigue generando (`chars`) aunque la vista (`shown`) se congele sin conexión. */
function useConnection() {
  const [phase, setPhase] = React.useState<ConnectionPhase>('online');
  const [chars, setChars] = React.useState(0);
  const [shown, setShown] = React.useState(0);
  const [attempt, setAttempt] = React.useState(1);
  const [tokens, setTokens] = React.useState(0);
  const phaseRef = React.useRef(phase);
  phaseRef.current = phase;
  const timers = useTimers();
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setChars((c) => {
        const next = Math.min(FULL.length, c + STEP);
        if (phaseRef.current === 'online' || phaseRef.current === 'resumed') setShown(next);
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const charsRef = React.useRef(chars);
  charsRef.current = chars;
  const shownRef = React.useRef(shown);
  shownRef.current = shown;
  const retry = () => {
    setPhase('reconnecting'); setAttempt(1);
    timers.after(1200, () => setAttempt(2));
    timers.after(2400, () => {
      setTokens(Math.max(1, Math.round((charsRef.current - shownRef.current) / 4)));
      setShown(charsRef.current); setPhase('resumed');
    });
    timers.after(4400, () => { if (phaseRef.current === 'resumed') setPhase('online'); });
  };
  const reset = () => { timers.clear(); setPhase('online'); setChars(0); setShown(0); };
  const force = (v: ConnectionPhase) => { timers.clear(); setPhase(v); setAttempt(2); if (v === 'resumed') setTokens(312); };
  return { phase, shown, attempt, tokens, drop: () => setPhase('dropped'), retry, reset, force };
}

function ConnectionDemo({ c }: { c: ReturnType<typeof useConnection> }) {
  const live = c.phase === 'online' || c.phase === 'resumed';
  return (
    <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 448 }}>
      <DemoBubble>Genera el informe de anticipos de septiembre</DemoBubble>
      <Typography variant="body1" color={live ? 'text.primary' : 'text.secondary'} sx={(t) => ({ minHeight: `calc(${t.typography.body1.lineHeight} * 3)` })}>
        {FULL.slice(0, c.shown)}
        {c.shown < FULL.length ? (
          <Box component="span" aria-hidden="true" sx={(t) => ({ display: 'inline-block', width: '2px', height: t.spacing(2), ml: 0.25, verticalAlign: 'text-bottom', bgcolor: 'primary.main', animation: `${caretBlink} 1s steps(2) infinite`, [REDUCED_MOTION]: { animation: 'none' } })} />
        ) : null}
      </Typography>
      <ConnectionState phase={c.phase} attempt={c.attempt} resumedTokens={c.tokens} onRetry={c.retry} />
    </Stack>
  );
}

export function ConnectionStateDoc() {
  const c = useConnection();
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><ConnectionDemo c={c} /></Box>}
        properties={
          <>
            <PropRow label="phase"><PropToggle<ConnectionPhase> label="phase" value={c.phase} onChange={c.force} options={[['online', 'online'], ['dropped', 'dropped'], ['reconnecting', 'reconnecting'], ['resumed', 'resumed']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="contained" onClick={c.drop} disabled={c.phase !== 'online'}>Drop the connection</Button>
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={c.reset}>Reset</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Tarjeta: la conexión se cae sola a mitad de la respuesta y se reconecta. */
export function ConnectionStateCard() {
  const c = useConnection();
  const { phase, shown } = c;
  const timers = useTimers();
  const dropped = React.useRef(false);
  React.useEffect(() => {
    if (!dropped.current && shown > 60) { dropped.current = true; c.drop(); timers.after(1600, c.retry); }
    if (phase === 'online' && shown >= FULL.length) timers.after(2500, () => { dropped.current = false; c.reset(); });
  }, [shown, phase]); // eslint-disable-line react-hooks/exhaustive-deps
  return <ConnectionDemo c={c} />;
}
