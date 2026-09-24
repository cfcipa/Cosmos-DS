import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { MessageQueue } from '../../src/ai/message-queue';
import type { QueuedMessage } from '../../src/ai/message-queue';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero aprobado «Message queue».
const START_RUNNING = 'Legaliza el anticipo CE-4492';
const START_QUEUED: QueuedMessage[] = [
  { id: 'q1', text: 'Envía el recordatorio a Transportes Andinos' },
  { id: 'q2', text: 'Genera el informe de anticipos de septiembre' },
  { id: 'q3', text: 'Prepara el cierre de tesorería del mes' },
];

export function MessageQueueDoc() {
  const [running, setRunning] = React.useState<string | undefined>(START_RUNNING);
  const [queued, setQueued] = React.useState<QueuedMessage[]>(START_QUEUED);
  const [draft, setDraft] = React.useState('');
  const nextId = React.useRef(START_QUEUED.length + 1);

  const cancel = (id: string) => setQueued((current) => current.filter((message) => message.id !== id));
  const sendNext = (id: string) => setQueued((current) => {
    const picked = current.find((message) => message.id === id);
    return picked ? [picked, ...current.filter((message) => message.id !== id)] : current;
  });
  /** Enter: si hay una ejecución, el mensaje entra a la fila; si no, sale de inmediato. */
  const submitDraft = () => {
    const text = draft.trim();
    if (!text) return;
    if (running) setQueued((current) => [...current, { id: `q${nextId.current++}`, text }]);
    else setRunning(text);
    setDraft('');
  };
  /** Al terminar, el primero de la fila empieza a ejecutarse. */
  const finishCurrent = () => {
    setRunning(queued[0]?.text);
    setQueued((current) => current.slice(1));
  };
  const reset = () => {
    setRunning(START_RUNNING);
    setQueued(START_QUEUED);
    setDraft('');
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 460 }}>
              <MessageQueue running={running} queued={queued} onCancel={cancel} onSendNext={sendNext} />
              <TextField
                size="small"
                fullWidth
                value={draft}
                placeholder="Escribe y pulsa Enter para encolar"
                inputProps={{ 'aria-label': 'Escribir mientras corre' }}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submitDraft(); } }}
              />
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="Run">
              <Button variant="contained" disabled={!running} onClick={finishCurrent}>Finish the current one</Button>
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={reset}>Reset</Button>
            </PropRow>
            <PropRow label="Advance">
              <Typography variant="caption" color="text.secondary">Manual, as in the reference: when one finishes, the first in the queue starts running.</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function MessageQueueCard() {
  const [queued, setQueued] = React.useState<QueuedMessage[]>(START_QUEUED.slice(0, 2));
  React.useEffect(() => { if (queued.length === 0) { const id = window.setTimeout(() => setQueued(START_QUEUED.slice(0, 2)), 1200); return () => window.clearTimeout(id); } return undefined; }, [queued]);
  const remove = (id: string) => setQueued((current) => current.filter((message) => message.id !== id));
  const sendNext = (id: string) => setQueued((current) => { const hit = current.find((m) => m.id === id); return hit ? [hit, ...current.filter((m) => m.id !== id)] : current; });
  return <Box sx={{ width: '100%' }}><MessageQueue running={START_RUNNING} queued={queued} onCancel={remove} onSendNext={sendNext} /></Box>;
}
