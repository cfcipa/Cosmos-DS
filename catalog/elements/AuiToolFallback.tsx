import * as React from 'react';
import type { ToolApprovalOption, ToolApprovalResponse, ToolCallMessagePart, ToolCallMessagePartStatus } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Play } from 'lucide-react';
import { AuiToolFallback, TOOL_APPROVED_RESULT } from '../../src/ai/aui';
import { riseSx, userBubbleSx } from '../../src/ai/lib/thread';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { APPROVAL_OK_RESULT, APPROVAL_TOOL } from '../ui/demoScripts';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { wait } from '../ui/demoStream';

const ASK = 'Envía el recordatorio de legalización a los responsables de anticipos vencidos.';
const INTRO = 'Busco los responsables y preparo el envío.';
const ARGS = JSON.stringify({ destinatarios: ['Nubia Rojas', 'Transportes Andinos', 'Ferretería El Roble'], plantilla: 'recordatorio_legalizacion' }, null, 2);
const AFTER = {
  sent: 'Listo: envié 3 recordatorios. El más urgente es CE-4492, de Nubia Rojas, que vence el 30 de septiembre.',
  denied: 'Entendido, no envié los recordatorios.',
  failed: 'No pude enviar los recordatorios: el servicio de correo no respondió. ¿Lo intento de nuevo?',
};
const OPTIONS: ToolApprovalOption[] = [
  { id: 'once', kind: 'allow-once', label: 'Permitir' },
  { id: 'always', kind: 'allow-always', label: 'Permitir siempre', confirm: { title: '¿Permitir siempre?', description: 'enviar_recordatorios no volverá a pedir aprobación en este espacio de trabajo.' }, grants: ['correo.enviar', 'terceros.leer'] },
  { id: 'deny', kind: 'reject-once', label: 'Rechazar' },
];
/** Ritmo del tablero: 1,8 s corriendo antes de pedir aprobación; 1,4 s más al aprobar. */
const RUN_MS = 1800;
const RESUME_MS = 1400;

type Status = 'running' | 'requires-action' | 'complete' | 'error' | 'cancelled';
type Mode = 'plain' | 'options' | 'text';
type Outcome = keyof typeof AFTER | null;
type State = { status: ToolCallMessagePartStatus; result?: unknown; ms?: number; outcome: Outcome; approval?: ToolCallMessagePart['approval']; key: number };

const statusOf = (s: Status): ToolCallMessagePartStatus => {
  if (s === 'error') return { type: 'incomplete', reason: 'error', error: 'El servicio de correo no respondió después de 30 s.' };
  if (s === 'cancelled') return { type: 'incomplete', reason: 'cancelled', error: 'El usuario detuvo la respuesta antes de terminar el envío.' };
  if (s === 'requires-action') return { type: 'requires-action', reason: 'tool-calls' };
  return { type: s };
};
const approvalFor = (mode: Mode): ToolCallMessagePart['approval'] => (mode === 'plain' ? undefined
  : mode === 'options' ? { id: 'call-1', prompt: '¿Envío el recordatorio de legalización a 3 responsables?', options: OPTIONS }
    : { id: 'call-1', prompt: '¿Qué nota agrego al recordatorio?', display: 'text', dismissible: true });

function useToolMachine(mode: Mode) {
  const [state, setState] = React.useState<State>({ status: { type: 'running' }, outcome: null, key: 0 });
  const [started, setStarted] = React.useState(Date.now());
  const [now, setNow] = React.useState(Date.now());
  const timers = React.useRef<number[]>([]);
  const clear = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  React.useEffect(() => () => clear(), []);
  const running = state.status.type === 'running';
  React.useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const run = React.useCallback(() => {
    clear();
    const t0 = Date.now();
    setStarted(t0); setNow(t0);
    setState((s) => ({ status: { type: 'running' }, outcome: null, key: s.key + 1 }));
    later(() => setState((s) => ({ ...s, status: { type: 'requires-action', reason: 'tool-calls' }, ms: Date.now() - t0, approval: approvalFor(mode) })), RUN_MS);
  }, [mode]);
  const pick = (s: Status) => {
    clear();
    setState((prev) => ({
      key: prev.key + 1, status: statusOf(s), approval: s === 'requires-action' ? approvalFor(mode) : undefined,
      ms: s === 'running' ? undefined : s === 'error' ? 30000 : s === 'cancelled' ? 900 : s === 'complete' ? 3200 : RUN_MS,
      result: s === 'complete' ? APPROVAL_OK_RESULT : undefined, outcome: s === 'complete' ? 'sent' : s === 'error' ? 'failed' : null,
    }));
    if (s === 'running') { const t0 = Date.now(); setStarted(t0); setNow(t0); }
  };
  /** Aprobado: vuelve a correr y termina con el resultado. */
  const resume = async (result: unknown) => {
    const t0 = Date.now() - (state.ms ?? 0);
    setStarted(t0); setNow(Date.now());
    setState((s) => ({ ...s, status: { type: 'running' } }));
    await wait(RESUME_MS);
    setState((s) => ({ ...s, status: { type: 'complete' }, result, ms: Date.now() - t0, outcome: 'sent' }));
  };
  const addResult = async (result: unknown) => {
    await wait(250);
    const approved = result === TOOL_APPROVED_RESULT;
    setState((s) => ({ ...s, status: { type: 'complete' }, result, outcome: approved ? 'sent' : 'denied' }));
  };
  const respondToApproval = async (r: ToolApprovalResponse) => {
    await wait(250);
    const denied = 'approved' in r && r.approved === false && !('optionId' in r) ? true : 'optionId' in r && r.optionId === 'deny';
    if ('text' in r && !('approved' in r) && !('optionId' in r) && !r.text.trim()) throw new Error('La respuesta no puede estar vacía.');
    if (denied) {
      const dismissed = mode === 'text';
      setState((s) => ({ ...s, approval: { ...s.approval!, approved: false }, status: dismissed ? { type: 'incomplete', reason: 'cancelled', error: 'El usuario descartó la solicitud.' } : { type: 'incomplete', reason: 'error', error: 'Ejecución rechazada por el usuario.' }, outcome: 'denied' }));
      return;
    }
    setState((s) => ({ ...s, approval: { ...s.approval!, approved: true } }));
    await resume('text' in r && r.text ? { ...APPROVAL_OK_RESULT, nota: r.text.trim() } : APPROVAL_OK_RESULT);
  };
  const ms = state.status.type === 'running' ? now - started : state.ms;
  const current: Status = state.status.type === 'incomplete' ? (state.status.reason === 'cancelled' ? 'cancelled' : 'error') : state.status.type as Status;
  return { state, ms, current, run, pick, addResult, respondToApproval };
}

function Demo({ mode, m }: { mode: Mode; m: ReturnType<typeof useToolMachine> }) {
  return (
    <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
      <Typography variant="body1" sx={userBubbleSx()}>{ASK}</Typography>
      <Box sx={{ px: 1 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>{INTRO}</Typography>
        <AuiToolFallback
          key={m.state.key}
          type="tool-call"
          toolCallId="call-1"
          toolName={APPROVAL_TOOL}
          args={{}}
          argsText={ARGS}
          status={m.state.status}
          result={m.state.result}
          approval={m.state.approval}
          elapsedMs={m.ms}
          addResult={mode === 'plain' ? m.addResult : undefined}
          respondToApproval={mode === 'plain' ? undefined : m.respondToApproval}
        />
        {m.state.outcome && <Box sx={(t) => ({ mt: 1, ...riseSx(t) })}><Typography variant="body1">{AFTER[m.state.outcome]}</Typography></Box>}
      </Box>
    </Stack>
  );
}

export function AuiToolFallbackDoc() {
  const [mode, setMode] = React.useState<Mode>('options');
  const m = useToolMachine(mode);
  const { run } = m;
  React.useEffect(() => { run(); }, [run]);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime>
        <ElementPage
          demoHeight={460}
          demo={<Demo mode={mode} m={m} />}
          properties={
            <>
              <PropRow label="status">
                <PropToggle<Status> label="status" value={m.current} onChange={m.pick} options={[['running', 'running'], ['requires-action', 'requires-action'], ['complete', 'complete'], ['error', 'error'], ['cancelled', 'cancelled']]} />
              </PropRow>
              <PropRow label="approval"><PropToggle<Mode> label="approval" value={mode} onChange={setMode} options={[['plain', 'Allow / Deny'], ['options', 'options'], ['text', 'text question']]} /></PropRow>
              <PropRow label="Try it"><Button variant="outlined" startIcon={<Play size={16} />} onClick={m.run}>Run the tool</Button></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiToolFallbackCard() {
  const m = useToolMachine('plain');
  const { run } = m;
  React.useEffect(() => { run(); }, [run]);
  return (
    <AuiDemoRuntime>
      <Box sx={{ maxHeight: 212, overflow: 'hidden' }}>
        <AuiToolFallback
          key={m.state.key}
          type="tool-call"
          toolCallId="call-1"
          toolName={APPROVAL_TOOL}
          args={{}}
          argsText={ARGS}
          status={m.state.status}
          result={m.state.result}
          elapsedMs={m.ms}
          addResult={m.addResult}
        />
      </Box>
    </AuiDemoRuntime>
  );
}

