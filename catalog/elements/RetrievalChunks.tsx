import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Copy, RefreshCw } from 'lucide-react';
import { RetrievalChunks } from '../../src/ai/retrieval-chunks';
import type { RetrievalChunk } from '../../src/ai/retrieval-chunks';
import { ToolCall } from '../../src/ai/tool-call';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Retrieval chunks».
const USER_MESSAGE = '¿Cuál es el plazo para legalizar un anticipo?';
const QUERY = '¿cuál es el plazo para legalizar un anticipo?';
const CHUNKS: RetrievalChunk[] = [
  { id: 'a', source: 'Política de anticipos v3.pdf', locator: '§ 2 · p. 3', score: 0.91, text: 'El anticipo se legaliza dentro de los 15 días siguientes a su uso, adjuntando los soportes de cada gasto.' },
  { id: 'b', source: 'Manual de Tesorería', locator: 'cap. 4', score: 0.84, text: 'Si el valor legalizado es menor al anticipo, el empleado devuelve la diferencia; si es mayor, se causa la cuenta por pagar.' },
  { id: 'c', source: 'Acta comité financiero 08-2026', locator: 'l. 42–48', score: 0.62, text: 'Se aprueba reducir el plazo de legalización de 30 a 15 días a partir de septiembre.' },
];
const ANSWER = 'Tienes 15 días desde el uso del anticipo para legalizarlo, con los soportes de cada gasto. Si legalizas menos del valor recibido, devuelves la diferencia; si es más, se causa una cuenta por pagar.';
/** Tiempos del tablero: la búsqueda, cada pasaje y la respuesta. */
const STEPS: Array<[number, number | 'answer']> = [[1400, 1], [2100, 2], [2800, 3], [3400, 'answer']];

type Flag = 'true' | 'false';

export function RetrievalChunksDoc() {
  const [visible, setVisible] = React.useState(0);
  const [searching, setSearching] = React.useState(true);
  const [answered, setAnswered] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const [startedAt, setStartedAt] = React.useState(Date.now());
  const [ms, setMs] = React.useState<number>();
  const timers = React.useRef<number[]>([]);
  const conversationRef = React.useRef<HTMLDivElement>(null);
  const stop = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };

  const run = React.useCallback(() => {
    stop();
    const t0 = Date.now();
    setVisible(0); setSearching(true); setAnswered(false); setOpen(true); setStartedAt(t0); setMs(undefined);
    STEPS.forEach(([at, step]) => timers.current.push(window.setTimeout(() => {
      if (step === 'answer') { setAnswered(true); return; }
      if (step === 1) { setSearching(false); setMs(Date.now() - t0); }
      setVisible(step);
    }, at)));
  }, []);
  React.useEffect(() => { run(); return stop; }, [run]);
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [visible, answered]);

  const showAnswer = answered && !searching;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box ref={conversationRef} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              <Stack spacing={1}>
                <ToolCall
                  toolName="buscar_documentos"
                  status={searching ? 'running' : 'complete'}
                  startedAt={searching ? startedAt : undefined}
                  durationMs={searching ? undefined : ms}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <RetrievalChunks query={QUERY} chunks={CHUNKS} visibleCount={visible} searching={searching} />
                </ToolCall>
                {showAnswer ? (
                  <>
                    <Typography variant="body1">{ANSWER}</Typography>
                    <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                      <Tooltip title="Copiar"><IconButton aria-label="Copiar"><Copy size={16} /></IconButton></Tooltip>
                      <Tooltip title="Regenerar"><IconButton aria-label="Regenerar" onClick={run}><RefreshCw size={16} /></IconButton></Tooltip>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="searching">
              <PropToggle<Flag>
                label="searching"
                value={searching ? 'true' : 'false'}
                onChange={(v) => {
                  stop();
                  const next = v === 'true';
                  setSearching(next);
                  if (next) setStartedAt(Date.now()); else setMs((m) => m ?? 1400);
                  setAnswered(!next && visible >= CHUNKS.length);
                }}
                options={[['true', 'true'], ['false', 'false']]}
              />
            </PropRow>
            <PropRow label="visibleCount">
              <PropToggle<string>
                label="visibleCount"
                value={String(visible)}
                onChange={(v) => { stop(); setVisible(Number(v)); setAnswered(!searching && Number(v) >= CHUNKS.length); }}
                options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']]}
              />
            </PropRow>
            <PropRow label="Try it">
              <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={run}>Retrieve again</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function RetrievalChunksCard() {
  return <Box sx={{ width: '100%' }}><RetrievalChunks query={QUERY} chunks={CHUNKS} visibleCount={2} searching={false} /></Box>;
}
