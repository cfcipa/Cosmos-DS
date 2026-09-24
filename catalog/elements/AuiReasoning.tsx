import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import {
  AuiReasoningContent, AuiReasoningPanel, AuiReasoningRoot, AuiReasoningText, AuiReasoningTrigger, type AuiReasoningVariant,
} from '../../src/ai/aui';
import { riseSx } from '../../src/ai/lib/thread';
import { DEMO_REASONING } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

const STEPS = [
  { title: 'Leyendo la solicitud', body: 'Busca el anticipo pendiente con la fecha de vencimiento más cercana.' },
  { title: 'Consultando anticipos', body: 'Tres pendientes: CE-4471, CE-4480 y CE-4492.' },
  { title: 'Comparando fechas', body: 'CE-4492 vence el 30 de septiembre, antes que los otros dos.' },
  { title: 'Verificando responsable', body: 'Nubia Rojas, gastos de viaje.' },
];
/** Ritmo del tablero: el razonamiento de a 2 caracteres cada 30 ms; un paso cada 1,1 s. */
const TRACE_STEP = 2;
const TRACE_TICK = 30;
const STEP_TICK = 1100;
const CLOCK_TICK = 250;
const CARD_LOOP = 9000;

type Design = 'trace' | 'steps';

function useReasoningPlayback(design: Design, run: number) {
  const [n, setN] = React.useState(0);
  const [k, setK] = React.useState(0);
  const [streaming, setStreaming] = React.useState(true);
  const [secs, setSecs] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const start = Date.now();
    setN(0); setK(design === 'steps' ? 1 : 0); setStreaming(true); setSecs(0); setElapsed(0);
    const finish = () => { setStreaming(false); setSecs(Math.max(1, Math.round((Date.now() - start) / 1000))); };
    const clock = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), CLOCK_TICK);
    const timer = window.setInterval(() => {
      if (design === 'steps') setK((c) => { if (c + 1 > STEPS.length) { window.clearInterval(timer); window.clearInterval(clock); finish(); return c; } return c + 1; });
      else setN((c) => { const next = c + TRACE_STEP; if (next >= DEMO_REASONING.length) { window.clearInterval(timer); window.clearInterval(clock); finish(); return DEMO_REASONING.length; } return next; });
    }, design === 'steps' ? STEP_TICK : TRACE_TICK);
    return () => { window.clearInterval(timer); window.clearInterval(clock); };
  }, [design, run]);
  return { text: DEMO_REASONING.slice(0, n), k, streaming, secs, elapsed };
}

function ReasoningDemo({ design, variant, defaultOpen, duration, run }: { design: Design; variant: AuiReasoningVariant; defaultOpen: boolean; duration: boolean; run: number }) {
  const { text, k, streaming, secs, elapsed } = useReasoningPlayback(design, run);
  const [userOpen, setUserOpen] = React.useState<boolean | null>(null);
  React.useEffect(() => setUserOpen(null), [run, design]);
  return (
    <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
      {design === 'trace' ? (
        // La clave reinicia el visor en cada «Razonar de nuevo», como una parte nueva del mensaje.
        <AuiReasoningRoot key={`${run}-${String(defaultOpen)}`} variant={variant} streaming={streaming} defaultOpen={defaultOpen}>
          <AuiReasoningTrigger active={streaming} duration={!streaming && duration ? secs : undefined} />
          <AuiReasoningContent aria-busy={streaming}>
            <AuiReasoningText>{text.split('\n\n').map((p, i) => <Box key={i} component="p" sx={{ m: 0 }}>{p}</Box>)}</AuiReasoningText>
          </AuiReasoningContent>
        </AuiReasoningRoot>
      ) : (
        <AuiReasoningPanel
          steps={STEPS}
          visibleSteps={Math.min(k, STEPS.length)}
          streaming={streaming}
          open={userOpen ?? streaming}
          onOpenChange={setUserOpen}
          restingLabel={duration ? `Pensó durante ${secs}s` : 'Terminó de pensar'}
          elapsed={duration ? `${elapsed}s` : undefined}
          sx={{ mb: 2 }}
        />
      )}
      {!streaming && (
        <Typography variant="body1" sx={(t) => riseSx(t)}>
          Vence primero <Box component="b" sx={{ fontWeight: 'fontWeightMedium' }}>CE-4492</Box>, de Nubia Rojas, el 30 de septiembre.
        </Typography>
      )}
    </Box>
  );
}

export function AuiReasoningDoc() {
  const [design, setDesign] = React.useState<Design>('trace');
  const [variant, setVariant] = React.useState<AuiReasoningVariant>('outline');
  const [defaultOpen, setDefaultOpen] = React.useState<'false' | 'true'>('false');
  const [duration, setDuration] = React.useState<'on' | 'off'>('on');
  const [run, setRun] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={424}
        demo={<Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', overflow: 'auto' }}><ReasoningDemo design={design} variant={variant} defaultOpen={defaultOpen === 'true'} duration={duration === 'on'} run={run} /></Box>}
        properties={
          <>
            <PropRow label="design"><PropToggle<Design> label="design" value={design} onChange={setDesign} options={[['trace', 'Reasoning'], ['steps', 'ReasoningPanel']]} /></PropRow>
            <PropRow label="variant"><PropToggle<AuiReasoningVariant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['ghost', 'ghost'], ['muted', 'muted']]} /></PropRow>
            <PropRow label="defaultOpen"><PropToggle label="defaultOpen" value={defaultOpen} onChange={setDefaultOpen} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
            <PropRow label="duration"><PropToggle label="duration" value={duration} onChange={setDuration} options={[['on', 'on'], ['off', 'off']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setRun((r) => r + 1)}>Reason again</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiReasoningCard() {
  const [run, setRun] = React.useState(0);
  // La tarjeta repite el razonamiento cada pocos segundos.
  React.useEffect(() => { const id = window.setInterval(() => setRun((r) => r + 1), CARD_LOOP); return () => window.clearInterval(id); }, []);
  return <Box sx={{ height: 212, overflow: 'hidden' }}><ReasoningDemo design="trace" variant="outline" defaultOpen={false} duration run={run} /></Box>;
}
