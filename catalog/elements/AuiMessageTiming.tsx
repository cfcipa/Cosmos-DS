import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RotateCcw } from 'lucide-react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiMessageTimingStats, AuiThread, auiTimingStats, type AuiThreadTiming } from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { AuiAsk, useAuiRegenerate } from '../ui/AuiAsk';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

const QUESTION = '¿Cuántos anticipos tengo pendientes?';
type Design = NonNullable<AuiThreadTiming['design']>;
type Side = NonNullable<AuiThreadTiming['side']>;

function Regenerate() {
  const regenerate = useAuiRegenerate();
  return <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={regenerate}>Regenerate</Button>;
}

export function AuiMessageTimingDoc() {
  const [design, setDesign] = React.useState<Design>('badge');
  const [side, setSide] = React.useState<Side>('right');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime>
        <AuiAsk question={QUESTION} />
        <ElementPage
          demoHeight={400}
          demo={<Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}><Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}><AuiThread autoFocus={false} messageTiming={{ design, side }} /></Box></Box>}
          properties={
            <>
              <PropRow label="design"><PropToggle<Design> label="design" value={design} onChange={setDesign} options={[['badge', 'badge'], ['footer', 'footer']]} /></PropRow>
              <PropRow label="side"><PropToggle<Side> label="side" value={side} onChange={setSide} options={[['top', 'top'], ['right', 'right'], ['bottom', 'bottom'], ['left', 'left']]} /></PropRow>
              <PropRow label="Try it"><Regenerate /></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

const CARD_ANSWER = 'Tienes 3 anticipos pendientes por $3.930.000. El próximo en vencer es CE-4492, de Nubia Rojas, el 30 de septiembre.';
/** Ritmo del tablero: primer token a los ~350 ms, 4 caracteres cada 40 ms; la tarjeta repite cada 7 s. */
const CARD_FIRST = 350;
const CARD_TICK = 40;
const CARD_STEP = 4;
const CARD_LOOP = 7000;

export function AuiMessageTimingCard() {
  const [run, setRun] = React.useState(0);
  const [state, setState] = React.useState({ n: 0, first: undefined as number | undefined, total: undefined as number | undefined, chunks: 0, start: Date.now() });
  React.useEffect(() => {
    const start = Date.now();
    setState({ n: 0, first: undefined, total: undefined, chunks: 0, start });
    let tick: number | undefined;
    const first = window.setTimeout(() => {
      setState((st) => ({ ...st, first: Date.now() - start }));
      tick = window.setInterval(() => setState((st) => {
        const n = Math.min(CARD_ANSWER.length, st.n + CARD_STEP);
        if (n >= CARD_ANSWER.length) window.clearInterval(tick);
        return { ...st, n, chunks: st.chunks + 1, total: n >= CARD_ANSWER.length ? Date.now() - start : undefined };
      }), CARD_TICK);
    }, CARD_FIRST);
    const loop = window.setTimeout(() => setRun((r) => r + 1), CARD_LOOP);
    return () => { window.clearTimeout(first); window.clearTimeout(loop); window.clearInterval(tick); };
  }, [run]);
  const elapsed = state.total ?? Date.now() - state.start;
  const tokens = Math.ceil(state.n / CARD_STEP);
  const speed = state.first !== undefined && elapsed > state.first ? tokens / ((elapsed - state.first) / 1000) : undefined;
  const stats = auiTimingStats({ streamStartTime: state.start, firstTokenTime: state.first, totalStreamTime: elapsed, tokensPerSecond: speed, totalChunks: state.chunks, toolCallCount: 0 }, true);
  return (
    <Stack spacing={1.5}>
      <Typography variant="body1" sx={userBubbleSx()}>¿Cuántos anticipos tengo pendientes?</Typography>
      <Typography variant="body1" sx={{ minHeight: (t) => t.spacing(6) }}>{CARD_ANSWER.slice(0, state.n)}</Typography>
      <AuiMessageTimingStats stats={stats} streaming={state.total === undefined} />
    </Stack>
  );
}
