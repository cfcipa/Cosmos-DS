// Cosmos DS · Kit IA · AUI connected (Sinco): Response preview.
// Referente: el tablero «Response preview».
// Con el asistente cerrado, la última respuesta asoma sobre la píldora apenas termina: una tarjeta con las dos primeras
// líneas. A los 4 s se recoge sola en una pestaña detrás de la píldora; al pasar por encima vuelve a asomar y al salir
// se recoge. Tocar el texto (o la pestaña, o arrastrar el asa hacia arriba) abre el asistente; la X la recoge. Si el
// asistente espera una aprobación, la tarjeta lo dice en primary y se queda hasta que la persona la mire.
import * as React from 'react';
import { useAuiState, type AssistantState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import { keyframes } from '@mui/material/styles';
import { MoonStar, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';
import { useAuiAssistant } from './AssistantPanel';

type Peek = 'card' | 'tab' | null;
type ToolCallInfo = { toolName: string; args: unknown };

export interface AuiResponsePreviewProps {
  /** Cuánto asoma la tarjeta antes de recogerse. Default 4000 ms; `Infinity`, no se recoge sola. */
  autoTuck?: number;
  /** El texto cuando el asistente espera una aprobación. */
  approvalText?: string | ((call: ToolCallInfo) => string);
  /** Cómo se muestra la respuesta que ya está al montar (un chat abierto de antes). Sin él, solo asoman las nuevas. */
  defaultPeek?: 'card' | 'tab';
}

/** Medidas del tablero: 8px sobre la píldora, pestaña de 12px, asa de 32 × 4, avatar de 24px, 2 líneas de texto. */
const GAP = 1;
const TAB = 12;
const HANDLE_W = 4;
const HANDLE_H = 0.5;
const AVATAR = 3;
const AVATAR_ICON = 14;
const LINES = 2;
/** Un arrastre de más de 12px hacia arriba abre. */
const DRAG_OPEN_PX = 12;
/** Salir de la tarjeta la recoge tras este respiro (para cruzar hacia la píldora sin que parpadee). */
const LEAVE_MS = 250;
const EASE_OUT = 'cubic-bezier(.32,.72,0,1)';
const EASE_IN = 'cubic-bezier(.4,0,.6,1)';
const cardIn = keyframes`from { opacity: 0; translate: 0 6px; } to { opacity: 1; translate: 0 0; }`;

const DEFAULT_APPROVAL = 'Necesito tu aprobación para continuar. Ábrelo para decidir.';

/** La última respuesta: su clave (cambia con cada respuesta terminada), su texto y si espera a la persona. */
function lastAnswer(s: AssistantState) {
  const m = s.thread.messages[s.thread.messages.length - 1];
  if (!m || m.role !== 'assistant') return '';
  if (m.status?.type === 'requires-action') return `${m.id}\u0000await`;
  if (m.status?.type === 'running' || s.thread.isRunning) return '';
  const text = m.content.map((p) => (p.type === 'text' ? p.text : '')).join(' ').trim();
  return text ? `${m.id}\u0000${text.length}` : '';
}

function lastText(s: AssistantState) {
  const m = s.thread.messages[s.thread.messages.length - 1];
  if (!m || m.role !== 'assistant') return '';
  return m.content.map((p) => (p.type === 'text' ? p.text : '')).join(' ').replace(/[*_`#>|]/g, '').replace(/[ \t\n\r]+/g, ' ').trim();
}

/** La llamada que espera a la persona, serializada (el selector devuelve un valor estable). */
function pendingCall(s: AssistantState) {
  const m = s.thread.messages[s.thread.messages.length - 1];
  if (!m || m.status?.type !== 'requires-action') return '';
  const call = m.content.find((p) => p.type === 'tool-call' && p.result === undefined);
  return call && call.type === 'tool-call' ? JSON.stringify({ toolName: call.toolName, args: call.args }) : '';
}

export function AuiResponsePreview({ autoTuck = 4000, approvalText = DEFAULT_APPROVAL, defaultPeek }: AuiResponsePreviewProps) {
  const assistant = useAuiAssistant();
  const surface = assistant?.surface ?? 'closed';
  const key = useAuiState(lastAnswer);
  const text = useAuiState(lastText);
  const callJson = useAuiState(pendingCall);
  const hasMessages = useAuiState((s) => s.thread.messages.length > 0);
  const running = useAuiState((s) => s.thread.isRunning);
  const awaiting = key.endsWith('\u0000await');
  const [peek, setPeek] = React.useState<Peek>(null);
  const lastKey = React.useRef(key);
  const prevSurface = React.useRef(surface);
  const hover = React.useRef(false);
  const timer = React.useRef<number>();
  const grabY = React.useRef<number | null>(null);
  // Solo asoma lo que llega de una ejecución; lo que carga el historial no (salvo `defaultPeek`, una vez).
  const ran = React.useRef(false);
  const initial = React.useRef(defaultPeek);
  React.useEffect(() => { if (running) ran.current = true; }, [running]);

  const tuckLater = React.useCallback((ms: number) => {
    window.clearTimeout(timer.current);
    if (!Number.isFinite(ms)) return;
    timer.current = window.setTimeout(() => { if (!hover.current) setPeek((p) => (p === 'card' ? 'tab' : p)); }, ms);
  }, []);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  // Al cerrar el asistente: la pestaña (o la tarjeta si hay una aprobación pendiente).
  React.useEffect(() => {
    const was = prevSurface.current;
    prevSurface.current = surface;
    if (surface !== 'closed' || was === 'closed') return;
    lastKey.current = key;
    setPeek(!hasMessages || running ? null : awaiting ? 'card' : 'tab');
  }, [surface, key, hasMessages, running, awaiting]);

  // Una respuesta nueva con el asistente cerrado asoma y se recoge sola.
  React.useEffect(() => {
    if (surface !== 'closed') { lastKey.current = key; return; }
    if (!key || key === lastKey.current) return;
    lastKey.current = key;
    const first = initial.current;
    initial.current = undefined;
    if (!ran.current && !first) return;
    ran.current = false;
    const next = first ?? 'card';
    setPeek(next);
    if (next === 'card') tuckLater(autoTuck);
  }, [key, surface, autoTuck, tuckLater]);

  if (surface !== 'closed' || !peek || !text && !awaiting) return null;
  const shown = awaiting ? (typeof approvalText === 'function' ? (callJson ? approvalText(JSON.parse(callJson) as ToolCallInfo) : DEFAULT_APPROVAL) : approvalText) : text;
  const open = () => assistant?.open();
  const tab = peek === 'tab';
  return (
    <Box data-slot="aui-response-preview-dock" sx={{ position: 'absolute', left: 0, right: 0, bottom: '100%', zIndex: 1, pointerEvents: 'none' }}>
      <Paper
        elevation={tab ? 1 : 8}
        data-slot="aui-response-preview"
        data-peek={peek}
        onMouseEnter={() => { hover.current = true; window.clearTimeout(timer.current); setPeek('card'); }}
        onMouseLeave={() => { hover.current = false; tuckLater(LEAVE_MS); }}
        onClick={() => { if (tab) open(); }}
        sx={(t) => ({
          position: 'absolute', left: 0, right: 0, bottom: t.spacing(GAP), pointerEvents: 'auto', boxSizing: 'border-box', p: t.spacing(0.75, 0.75, 1.5, 1.5),
          border: 1, borderColor: 'divider', overflow: 'hidden', clipPath: `inset(0 0 0 0 round ${t.shape.borderRadius}px)`,
          transition: `transform 320ms ${EASE_OUT}, clip-path 320ms ${EASE_OUT}, box-shadow 320ms ease`,
          animation: `${cardIn} ${t.transitions.duration.enteringScreen}ms ${EASE_OUT} backwards`,
          '&[data-peek="tab"]': {
            transform: 'translateY(calc(100% - 2px)) scaleX(.94)', clipPath: `inset(0 0 calc(100% - ${TAB}px) 0 round ${t.shape.borderRadius}px)`, cursor: 'pointer',
            transition: `transform 260ms ${EASE_IN}, clip-path 260ms ${EASE_IN}, box-shadow 200ms ease`,
          },
          '& [data-slot="aui-response-preview-body"]': { transition: 'opacity 220ms ease-in 80ms' },
          '&[data-peek="tab"] [data-slot="aui-response-preview-body"]': { opacity: 0, transition: 'opacity 120ms linear' },
          [REDUCED_MOTION]: { animation: 'none', transition: 'opacity 150ms', '&[data-peek="tab"]': { transition: 'opacity 150ms' } },
        })}
      >
        <Box
          aria-hidden="true"
          onPointerDown={(e) => { grabY.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerUp={(e) => { if (grabY.current !== null && grabY.current - e.clientY > DRAG_OPEN_PX) open(); grabY.current = null; }}
          sx={(t) => ({
            position: 'absolute', top: t.spacing(0.5), left: '50%', width: t.spacing(HANDLE_W), height: t.spacing(HANDLE_H), ml: `-${t.spacing(HANDLE_W / 2)}`,
            borderRadius: 1, bgcolor: 'action.disabled', cursor: 'grab', touchAction: 'none',
            '&::after': { content: '""', position: 'absolute', inset: t.spacing(-1, -2) },
          })}
        />
        <Box data-slot="aui-response-preview-body" ref={(node: HTMLDivElement | null) => { if (node) node.inert = tab; }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
            <Box
              component="span"
              aria-hidden="true"
              sx={(t) => ({ width: t.spacing(AVATAR), height: t.spacing(AVATAR), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: t.palette.ai.markIcon, background: `linear-gradient(135deg, ${t.palette.ai.markStart}, ${t.palette.ai.markEnd})` })}
            >
              <MoonStar size={AVATAR_ICON} />
            </Box>
            <AuiIconButton tooltip="Ocultar" aria-label="Ocultar la respuesta" onClick={(e) => { e.stopPropagation(); window.clearTimeout(timer.current); hover.current = false; setPeek('tab'); }}><X /></AuiIconButton>
          </Box>
          <ButtonBase
            onClick={(e) => { e.stopPropagation(); open(); }}
            data-await={awaiting}
            sx={(t) => ({
              ...t.typography.body1, display: '-webkit-box', WebkitLineClamp: LINES, WebkitBoxOrient: 'vertical', overflow: 'hidden', width: '100%', mt: 0.5, pr: 0.75,
              textAlign: 'start', justifyContent: 'flex-start', color: 'text.primary', borderRadius: 0.5,
              '&:hover': { color: 'primary.main' }, '&[data-await="true"]': { color: 'primary.main', fontWeight: t.typography.fontWeightMedium },
              '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
            })}
          >
            {shown}
          </ButtonBase>
        </Box>
      </Paper>
    </Box>
  );
}
