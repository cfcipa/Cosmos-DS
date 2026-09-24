import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Copy, RefreshCw, RotateCcw } from 'lucide-react';
import { ToolCall } from '../../src/ai/tool-call';
import type { ToolCallStatus } from '../../src/ai/tool-call';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Tool approval».
const USER_MESSAGE = 'Confirma las facturas FV-0932 y FV-0935';
const INTRO = 'Reviso las dos facturas y te pido aprobación antes de confirmarlas.';
const TOOL_NAME = 'confirmar_facturas';
const ARGS = { facturas: ['FV-0932', 'FV-0935'], total: 7430000 };
const RESULT = { confirmadas: ['FV-0932', 'FV-0935'], estado: 'confirmada' };
const PROMPT = '¿Confirmo 2 facturas por $ 7.430.000?';
const REJECTED = 'Rechazaste la acción.';
const AFTER: Partial<Record<ToolCallStatus, string>> = {
  complete: 'Listo, confirmé FV-0932 y FV-0935 por $ 7.430.000. Ya aparecen como confirmadas.',
  cancelled: 'Entendido, no confirmé ninguna. FV-0932 y FV-0935 siguen pendientes.',
};
/** Tiempos del tablero: la respuesta del asistente aparece y la herramienta corre. */
const REPLY_MS = 450;
const RUN_MS = 1200;

type DemoStatus = Extract<ToolCallStatus, 'requires-action' | 'running' | 'complete' | 'cancelled'>;

export function ToolApprovalDoc() {
  const [hasReply, setHasReply] = React.useState(false);
  const [status, setStatus] = React.useState<DemoStatus>('requires-action');
  const [open, setOpen] = React.useState(true);
  const [startedAt, setStartedAt] = React.useState<number>();
  const timer = React.useRef<number>();
  const conversationRef = React.useRef<HTMLDivElement>(null);

  const stop = () => window.clearTimeout(timer.current);
  const replay = React.useCallback(() => {
    stop();
    setHasReply(false);
    setStatus('requires-action');
    setOpen(true);
    setStartedAt(undefined);
    timer.current = window.setTimeout(() => setHasReply(true), REPLY_MS);
  }, []);
  React.useEffect(() => { replay(); return stop; }, [replay]);
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [hasReply, status, open]);

  /** Aprobar corre la herramienta y termina; Rechazar la cancela con el motivo. */
  const respond = (approved: boolean) => {
    stop();
    setHasReply(true);
    if (!approved) { setStatus('cancelled'); setOpen(false); return; }
    setStatus('running');
    setOpen(false);
    setStartedAt(Date.now());
    timer.current = window.setTimeout(() => setStatus('complete'), RUN_MS);
  };
  const pickStatus = (next: DemoStatus) => {
    if (next === 'running') { respond(true); return; }
    stop();
    setHasReply(true);
    setStatus(next);
    setOpen(next !== 'cancelled');
  };

  const isDone = status === 'complete' || status === 'cancelled';

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box ref={conversationRef} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={2} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              {hasReply ? (
                <Stack spacing={1}>
                  <Typography variant="body1">{INTRO}</Typography>
                  <ToolCall
                    toolName={TOOL_NAME}
                    status={status}
                    args={ARGS}
                    result={status === 'complete' ? RESULT : undefined}
                    error={status === 'cancelled' ? REJECTED : undefined}
                    durationMs={status === 'complete' ? RUN_MS : undefined}
                    startedAt={status === 'running' ? startedAt : undefined}
                    open={open}
                    onOpenChange={setOpen}
                    requiresActionLabel="Requiere aprobación"
                    approval={{ prompt: PROMPT, onRespond: (id) => respond(id === 'approve') }}
                  />
                  {isDone ? (
                    <>
                      <Typography variant="body1">{AFTER[status]}</Typography>
                      <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                        <Tooltip title="Copiar"><IconButton aria-label="Copiar"><Copy size={16} /></IconButton></Tooltip>
                        <Tooltip title="Regenerar"><IconButton aria-label="Regenerar" onClick={replay}><RefreshCw size={16} /></IconButton></Tooltip>
                      </Stack>
                    </>
                  ) : null}
                </Stack>
              ) : null}
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="status">
              <PropToggle<DemoStatus>
                label="status"
                value={status}
                onChange={pickStatus}
                options={[['requires-action', 'requires-action'], ['running', 'running'], ['complete', 'complete'], ['cancelled', 'cancelled']]}
              />
            </PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={replay}>Replay</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function ToolApprovalCard() {
  return (
    <Box sx={{ width: '100%' }}>
      <ToolCall toolName={TOOL_NAME} status="requires-action" args={ARGS} requiresActionLabel="Requiere aprobación" approval={{ prompt: PROMPT }} />
    </Box>
  );
}
