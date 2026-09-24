import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Play, Copy, RefreshCw } from 'lucide-react';
import { ToolCall } from './ToolCall';
import type { ToolCallStatus, ToolApprovalProps, ToolApprovalOption } from './types';
import { ElementPage, PropRow, PropToggle } from '../../storybook/ElementPage';
import { DemoViewport, DemoUser, DemoAssistantText } from '../../storybook/Conversation';

// Contenido del tablero aprobado «Tool fallback» (lienzo Asistente Cosmos · AUI connected).
const ARGS = '{\n  "destinatarios": ["Nubia Rojas", "Transportes Andinos", "Ferretería El Roble"],\n  "plantilla": "recordatorio_legalizacion"\n}';
const RESULT = '{\n  "enviados": 3,\n  "anticipos": ["CE-4492", "CE-4480", "CE-4471"]\n}';
const AFTER = {
  sent: 'Listo: envié 3 recordatorios. El más urgente es CE-4492, de Nubia Rojas, que vence el 30 de septiembre.',
  denied: 'Entendido, no envié los recordatorios.',
  failed: 'No pude enviar los recordatorios: el servicio de correo no respondió. ¿Lo intento de nuevo?',
} as const;
type Outcome = keyof typeof AFTER | null;
type Mode = 'plain' | 'options' | 'text';
type Pick = 'running' | 'requires-action' | 'complete' | 'error' | 'cancelled';

const OPTIONS: ToolApprovalOption[] = [
  { id: 'once', kind: 'allow', label: 'Permitir' },
  { id: 'always', kind: 'allow-always', label: 'Permitir siempre', confirm: { title: '¿Permitir siempre?', description: 'enviar_recordatorios no volverá a pedir aprobación en este espacio de trabajo.', grants: ['correo.enviar', 'terceros.leer'] } },
  { id: 'deny', kind: 'reject', label: 'Rechazar' },
];
const PLAIN: ToolApprovalOption[] = [{ id: 'allow', kind: 'allow', label: 'Permitir' }, { id: 'deny', kind: 'reject', label: 'Rechazar' }];

interface S { status: ToolCallStatus; ms: number; startedAt?: number; open: boolean; result?: string; error?: string; outcome: Outcome; locked: boolean }
const fresh = (): S => ({ status: 'running', ms: 0, startedAt: Date.now(), open: false, outcome: null, locked: false });

function ToolFallbackPage() {
  const [mode, setMode] = React.useState<Mode>('options');
  const [s, setS] = React.useState<S>(fresh);
  const timers = React.useRef<number[]>([]);
  const vp = React.useRef<HTMLDivElement>(null);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const follow = () => later(220, () => { if (vp.current) vp.current.scrollTop = vp.current.scrollHeight; });
  React.useEffect(() => () => clear(), []);

  const run = () => {
    clear();
    const t0 = Date.now();
    setS({ ...fresh(), startedAt: t0 });
    later(1800, () => { setS((p) => ({ ...p, status: 'requires-action', open: true, ms: Date.now() - t0, startedAt: undefined })); follow(); });
  };
  React.useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Tras responder: vuelve a «running» y termina en `final`. */
  const resume = (final: Partial<S>, wait: number) => {
    clear();
    setS((p) => ({ ...p, locked: true }));
    later(250, () => {
      const base = s.ms; const t0 = Date.now();
      setS((p) => ({ ...p, status: 'running', locked: false, startedAt: t0 - base }));
      later(wait, () => { setS((p) => ({ ...p, ...final, ms: base + Date.now() - t0, startedAt: undefined })); follow(); });
    });
  };
  const settle = (final: Partial<S>) => { clear(); setS((p) => ({ ...p, locked: true })); later(250, () => { setS((p) => ({ ...p, locked: false, ...final })); follow(); }); };
  const sent: Partial<S> = { status: 'complete', result: RESULT, outcome: 'sent' };

  const pick = (v: Pick) => {
    clear();
    const base: S = { status: 'complete', ms: 0, open: s.open, outcome: null, locked: false };
    if (v === 'running') setS({ ...base, status: 'running', startedAt: Date.now() });
    if (v === 'requires-action') setS({ ...base, status: 'requires-action', open: true, ms: 1800 });
    if (v === 'complete') setS({ ...base, ms: 3200, result: RESULT, outcome: 'sent' });
    if (v === 'error') setS({ ...base, status: 'error', ms: 30000, error: 'El servicio de correo no respondió después de 30 s.', outcome: 'failed' });
    if (v === 'cancelled') setS({ ...base, status: 'cancelled', ms: 900, error: 'El usuario detuvo la respuesta antes de terminar el envío.' });
    follow();
  };

  const approval: ToolApprovalProps = mode === 'text'
    ? {
      mode: 'text', prompt: '¿Qué nota agrego al recordatorio?', disabled: s.locked,
      onRespond: (id, answer) => {
        if (id === 'dismiss') settle({ status: 'cancelled', error: 'El usuario descartó la solicitud.', outcome: 'denied' });
        else resume({ status: 'complete', result: '{\n  "enviados": 3,\n  "nota": "' + (answer || '') + '"\n}', outcome: 'sent' }, 1400);
      },
    }
    : {
      prompt: mode === 'plain' ? undefined : '¿Envío el recordatorio de legalización a 3 responsables?',
      options: mode === 'plain' ? PLAIN : OPTIONS, disabled: s.locked,
      onRespond: (id) => {
        if (mode === 'plain') settle(id === 'allow' ? { status: 'complete', result: 'Aprobado por el usuario', outcome: 'sent' } : { status: 'complete', result: 'El usuario rechazó la ejecución de la herramienta', outcome: 'denied' });
        else if (id === 'deny') settle({ status: 'error', error: 'Ejecución rechazada por el usuario.', outcome: 'denied' });
        else resume(sent, 1400);
      },
    };

  const done = s.status === 'complete' || s.status === 'error' || s.status === 'cancelled';
  const ra = s.status === 'requires-action';
  const statusCode = s.status === 'error' ? '{ type: "incomplete", reason: "error" }'
    : s.status === 'cancelled' ? '{ type: "incomplete", reason: "cancelled" }'
      : ra ? '{ type: "requires-action", reason: "tool-calls" }' : '{ type: "' + s.status + '" }';
  const apCode = mode === 'plain' ? '\n  addResult={addResult}'
    : mode === 'options' ? '\n  approval={{ id: "call-1", options: [once, always, deny] }}\n  respondToApproval={respondToApproval}'
      : '\n  approval={{ id: "call-1", display: "text", dismissible: true }}\n  respondToApproval={respondToApproval}';
  const code = '<ToolFallback\n  toolName="enviar_recordatorios"\n  argsText={argsText}\n  status={' + statusCode + '}' + (ra || s.outcome ? apCode : '') + (s.result !== undefined ? '\n  result={result}' : '') + '\n/>';

  return (
    <ElementPage
      section="AUI connected"
      title="Tool fallback"
      description="El renderizador por defecto para llamadas a herramientas que no tienen una interfaz dedicada."
      demo={
        <DemoViewport ref={vp}>
          <DemoUser>Envía el recordatorio de legalización a los responsables de anticipos vencidos.</DemoUser>
          <Stack spacing={0.5}>
            <DemoAssistantText>Busco los responsables y preparo el envío.</DemoAssistantText>
            <Box sx={{ px: 1 }}>
              <ToolCall
                toolName="enviar_recordatorios" status={s.status} args={ARGS} result={s.result} error={s.error}
                startedAt={s.status === 'running' ? s.startedAt : undefined}
                durationMs={s.status === 'running' && s.startedAt ? undefined : s.ms}
                open={s.open} onOpenChange={(o) => { setS((p) => ({ ...p, open: o })); if (o) follow(); }}
                approval={approval}
              />
            </Box>
            {done && s.outcome ? <DemoAssistantText>{AFTER[s.outcome]}</DemoAssistantText> : null}
            {done ? (
              <Stack direction="row" sx={{ pt: 0.75, ml: 0.5, minHeight: 30 }}>
                <IconButton size="small" aria-label="Copiar" title="Copiar"><Copy size={16} /></IconButton>
                <IconButton size="small" aria-label="Regenerar" title="Regenerar" onClick={run}><RefreshCw size={16} /></IconButton>
              </Stack>
            ) : null}
          </Stack>
        </DemoViewport>
      }
      properties={
        <>
          <PropRow label="status">
            <PropToggle<Pick> label="status" value={(s.status === 'requires-action' ? 'requires-action' : s.status) as Pick} onChange={pick}
              options={[['running', 'running'], ['requires-action', 'requires-action'], ['complete', 'complete'], ['error', 'error'], ['cancelled', 'cancelled']]} />
          </PropRow>
          <PropRow label="approval">
            <PropToggle<Mode> label="approval" value={mode} onChange={setMode}
              options={[['plain', 'Allow / Deny'], ['options', 'options'], ['text', 'text question']]} />
          </PropRow>
          <PropRow label="Try it">
            <Button variant="contained" startIcon={<Play size={18} />} onClick={run}>Run the tool</Button>
            <Typography variant="caption" color="text.secondary">running → requires-action → your answer</Typography>
          </PropRow>
        </>
      }
      code={code}
    />
  );
}

const meta: Meta = {
  title: 'Elementos/AUI connected/Tool fallback',
  parameters: { layout: 'fullscreen', demoWidth: 600, controls: { disable: true } },
};
export default meta;

export const Tablero: StoryObj = { name: 'Tool fallback', render: () => <ToolFallbackPage /> };
