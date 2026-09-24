import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { ErrorState } from '../../src/ai/error-state';
import { useTimers } from '../ui/useTimers';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { DemoBubble } from '../ui/DemoBubble';

// Contenido del tablero aprobado «Error state».
const QUESTION = 'Concilia el extracto de agosto con la cuenta 1110';
const TITLE = 'No se pudo completar la respuesta';
const DETAIL = 'Se perdió la conexión con el servicio. Tu mensaje sigue aquí.';
const ANSWER = 'Concilié 42 movimientos. Quedan 2 sin pareja: un abono del 14 de agosto y una comisión bancaria del 31.';
const RETRY_MS = 1800;

type Phase = 'failed' | 'retrying' | 'ok';
type Outcome = 'ok' | 'fail';

export function ErrorStateDoc() {
  const [phase, setPhase] = React.useState<Phase>('failed');
  const [outcome, setOutcome] = React.useState<Outcome>('ok');
  const retryTimer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  const retry = () => {
    window.clearTimeout(retryTimer.current);
    setPhase('retrying');
    retryTimer.current = window.setTimeout(() => setPhase(outcome === 'ok' ? 'ok' : 'failed'), RETRY_MS);
  };
  const failAgain = () => {
    window.clearTimeout(retryTimer.current);
    setPhase('failed');
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 460 }}>
              <DemoBubble>{QUESTION}</DemoBubble>
              {phase === 'ok'
                ? <Typography component="p" variant="body1" sx={{ m: 0 }}>{ANSWER}</Typography>
                : <ErrorState title={TITLE} detail={DETAIL} retrying={phase === 'retrying'} onRetry={retry} />}
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="Result">
              <PropToggle<Outcome> label="Retry result" value={outcome} onChange={setOutcome} options={[['ok', 'succeeds'], ['fail', 'fails again']]} />
            </PropRow>
            <PropRow label="retrying">
              <PropToggle<'true' | 'false'>
                label="retrying"
                value={phase === 'retrying' ? 'true' : 'false'}
                onChange={(value) => { window.clearTimeout(retryTimer.current); setPhase(value === 'true' ? 'retrying' : 'failed'); }}
                options={[['false', 'false'], ['true', 'true']]}
              />
            </PropRow>
            <PropRow label="Demo">
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={failAgain}>Fail again</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function ErrorStateCard() {
  const { after } = useTimers();
  const [retrying, setRetrying] = React.useState(false);
  return <ErrorState title={TITLE} detail={DETAIL} retrying={retrying} onRetry={() => { setRetrying(true); after(RETRY_MS, () => setRetrying(false)); }} />;
}
