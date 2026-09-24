import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { StoppedRun } from '../../src/ai/stopped-run';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { DemoBubble } from '../ui/DemoBubble';

// Contenido del tablero aprobado «Stopped run».
const QUESTION = 'Explícame cómo legalizar un anticipo de viaje';
const FULL_WORDS = 'Para legalizar un anticipo de viaje, entra a Tesorería, abre el anticipo y adjunta los soportes de cada gasto. El sistema cruza el total con el valor entregado: si sobra, genera la devolución; si falta, crea la cuenta por pagar al empleado.'.split(' ');
const STOPPED_AT = 18;
const WORD_INTERVAL_MS = 70;
const REASON_LABELS = { user: 'detenida por ti', length: 'límite de longitud', connection: 'conexión perdida' } as const;

type Reason = keyof typeof REASON_LABELS;
type Phase = 'stopped' | 'streaming' | 'done' | 'discarded';

export function StoppedRunDoc() {
  const [reason, setReason] = React.useState<Reason>('user');
  const [phase, setPhase] = React.useState<Phase>('stopped');
  const [wordCount, setWordCount] = React.useState(STOPPED_AT);
  const streamTimer = React.useRef<number>();
  const stopStream = () => window.clearInterval(streamTimer.current);
  React.useEffect(() => stopStream, []);
  React.useEffect(() => {
    if (phase === 'streaming' && wordCount >= FULL_WORDS.length) { stopStream(); setPhase('done'); }
  }, [phase, wordCount]);

  /** Continuar = reload(): se genera una respuesta nueva desde el principio. */
  const continueRun = () => {
    stopStream();
    setWordCount(0);
    setPhase('streaming');
    streamTimer.current = window.setInterval(() => setWordCount((count) => count + 1), WORD_INTERVAL_MS);
  };
  const stopAgain = () => { stopStream(); setWordCount(STOPPED_AT); setPhase('stopped'); };
  const text = FULL_WORDS.slice(0, wordCount).join(' ');

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 460 }}>
              <DemoBubble>{QUESTION}</DemoBubble>
              {phase === 'stopped' ? (
                <StoppedRun text={text} reason={REASON_LABELS[reason]} onContinue={continueRun} onDiscard={() => setPhase('discarded')} />
              ) : null}
              {phase === 'streaming' || phase === 'done' ? <Typography component="p" variant="body1" sx={{ m: 0 }}>{text}</Typography> : null}
              {phase === 'discarded' ? <Typography variant="body3" color="text.secondary">Respuesta descartada. El mensaje se eliminó del hilo.</Typography> : null}
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="reason">
              <PropToggle<Reason> label="Reason" value={reason} onChange={setReason} options={[['user', 'by user'], ['length', 'length limit'], ['connection', 'connection lost']]} />
            </PropRow>
            <PropRow label="Demo">
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={stopAgain}>Stop again</Button>
            </PropRow>
            <PropRow label="Continue">
              <Typography variant="caption" color="text.secondary">Calls reload(): regenerates, doesn't literally resume.</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function StoppedRunCard() {
  const [outcome, setOutcome] = React.useState<'stopped' | 'continued' | 'discarded'>('stopped');
  React.useEffect(() => {
    if (outcome === 'stopped') return undefined;
    const id = window.setTimeout(() => setOutcome('stopped'), 2400);
    return () => window.clearTimeout(id);
  }, [outcome]);
  if (outcome === 'continued') return <Typography variant="body1">{FULL_WORDS.join(' ')}</Typography>;
  if (outcome === 'discarded') return <Typography variant="body3" color="text.secondary">Respuesta descartada. El mensaje se eliminó del hilo.</Typography>;
  return (
    <Box sx={{ width: '100%' }}>
      <StoppedRun text={FULL_WORDS.slice(0, STOPPED_AT).join(' ')} reason={REASON_LABELS.user} onContinue={() => setOutcome('continued')} onDiscard={() => setOutcome('discarded')} />
    </Box>
  );
}
