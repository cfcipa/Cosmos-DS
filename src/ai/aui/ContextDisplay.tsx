// Cosmos DS · Kit IA · AUI connected: Context display.
// Referente: assistant-ui «Context display» (elements/context-display.tsx y context-display.aui.tsx).
// El uso de la ventana de contexto del modelo como anillo, barra o texto. Al pasar el cursor (o al llegar con Tab) se
// ve el detalle: «N% lleno», los tokens usados sobre la ventana y, si el proveedor los reporta, entrada, entrada en
// caché, salida y razonamiento. Pasa a advertencia desde 65% y a crítico sobre 85%. Sin uso todavía no se muestra.
// Conectado, lee el uso del último mensaje del asistente (`metadata.custom.usage` o, si no, `metadata.steps`) y se
// reinicia al cambiar de hilo; con `usage` se controla desde fuera.
import * as React from 'react';
import { useAuiState, type ThreadMessage } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type AuiTokenUsage = {
  totalTokens?: number | undefined;
  inputTokens?: number | undefined;
  cachedInputTokens?: number | undefined;
  outputTokens?: number | undefined;
  reasoningTokens?: number | undefined;
};
export type AuiContextSide = 'top' | 'bottom' | 'left' | 'right';

/** Umbrales de assistant-ui: advertencia desde 65%, crítico sobre 85%. */
export const CONTEXT_WARNING = 65;
export const CONTEXT_CRITICAL = 85;
/** Medidas de assistant-ui: anillo de 18px con trazo de 2,5; barra de 64×6; detalle de 224px con barra de 4px. */
const RING_SIZE = 18;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const BAR_WIDTH = 8;
const BAR_HEIGHT = 0.75;
const DETAIL_WIDTH = 28;
const DETAIL_BAR_HEIGHT = 0.5;
const DETAIL_OFFSET = 8;
const THOUSAND = 1_000;
const MILLION = 1_000_000;

const compact = (n: number) => n.toFixed(1).replace(/\.0$/, '').replace('.', ',');
/** «9,3k», «1,2M». */
export function formatTokenCount(tokens: number): string {
  if (tokens >= MILLION) return `${compact(tokens / MILLION)}M`;
  if (tokens >= THOUSAND) return `${compact(tokens / THOUSAND)}k`;
  return `${tokens}`;
}

type Severity = 'normal' | 'warning' | 'critical';
const severityOf = (percent: number): Severity => (percent > CONTEXT_CRITICAL ? 'critical' : percent >= CONTEXT_WARNING ? 'warning' : 'normal');
const toneOf = (t: Theme, severity: Severity) => (severity === 'critical' ? t.palette.error.main : severity === 'warning' ? t.palette.warning.main : t.palette.text.primary);
const labelToneOf = (t: Theme, severity: Severity) => (severity === 'normal' ? t.palette.text.secondary : toneOf(t, severity));
const monoSx = (t: Theme) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' });

type ContextValue = { usage: AuiTokenUsage | undefined; totalTokens: number; percent: number; severity: Severity; modelContextWindow: number };
const ContextDisplayContext = React.createContext<ContextValue | null>(null);
function useContextDisplay() {
  const ctx = React.useContext(ContextDisplayContext);
  if (!ctx) throw new Error('AuiContextDisplay.* va dentro de AuiContextDisplayRoot');
  return ctx;
}

const totalOf = (usage: AuiTokenUsage | undefined) =>
  usage?.totalTokens ?? ((usage?.inputTokens ?? 0) + (usage?.cachedInputTokens ?? 0) + (usage?.outputTokens ?? 0) + (usage?.reasoningTokens ?? 0));

function usageOf(message: ThreadMessage | undefined): AuiTokenUsage | undefined {
  if (!message || message.role !== 'assistant') return undefined;
  const custom = message.metadata.custom?.usage as AuiTokenUsage | undefined;
  if (custom) return custom;
  const steps = message.metadata.steps ?? [];
  const last = [...steps].reverse().find((step) => step.usage)?.usage;
  return last ? { inputTokens: last.inputTokens, outputTokens: last.outputTokens } : undefined;
}

/** El uso del hilo: el del último mensaje del asistente que lo reporta. */
export function useAuiThreadTokenUsage(): AuiTokenUsage | undefined {
  const messages = useAuiState((s) => s.thread.messages);
  return React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const usage = usageOf(messages[i]);
      if (usage) return usage;
    }
    return undefined;
  }, [messages]);
}

export interface AuiContextDisplayRootProps {
  modelContextWindow: number;
  /** Uso controlado desde fuera; sin él, lo lee del hilo. */
  usage?: AuiTokenUsage | undefined;
  /** Reinicia el total guardado (conectado: el id del hilo). */
  resetKey?: string | undefined;
  children: React.ReactNode;
}

function RootBase({ modelContextWindow, usage, resetKey, children }: AuiContextDisplayRootProps) {
  // Entre actualizaciones el proveedor puede mandar uso sin total; se conserva el último total positivo del mismo hilo.
  const raw = totalOf(usage);
  const [kept, setKept] = React.useState({ resetKey, totalTokens: raw > 0 ? raw : 0, usage });
  if (kept.resetKey !== resetKey || (raw > 0 && raw !== kept.totalTokens) || usage !== kept.usage) {
    const next = kept.resetKey !== resetKey
      ? { resetKey, totalTokens: raw > 0 ? raw : 0, usage }
      : { resetKey, totalTokens: raw > 0 ? raw : kept.totalTokens, usage };
    setKept(next);
  }
  const current = kept.resetKey === resetKey ? kept : { totalTokens: raw > 0 ? raw : 0, usage };
  const percent = current.totalTokens ? Math.min((current.totalTokens / modelContextWindow) * 100, 100) : 0;
  const value = React.useMemo<ContextValue>(
    () => ({ usage: current.usage, totalTokens: current.totalTokens, percent, severity: severityOf(percent), modelContextWindow }),
    [current.usage, current.totalTokens, percent, modelContextWindow],
  );
  if (current.usage === undefined && current.totalTokens <= 0) return null;
  return <ContextDisplayContext.Provider value={value}>{children}</ContextDisplayContext.Provider>;
}

function ConnectedRoot(props: Omit<AuiContextDisplayRootProps, 'usage' | 'resetKey'>) {
  const usage = useAuiThreadTokenUsage();
  const threadId = useAuiState((s) => s.threadListItem.id);
  return <RootBase {...props} usage={usage} resetKey={threadId} />;
}

export function AuiContextDisplayRoot(props: AuiContextDisplayRootProps) {
  return props.usage !== undefined ? <RootBase {...props} /> : <ConnectedRoot {...props} />;
}

/** El detalle: «N% lleno», la barra y los tokens por tipo. */
export function AuiContextDisplayDetail() {
  const { usage, totalTokens, percent, severity, modelContextWindow } = useContextDisplay();
  const segments = [
    { label: 'Entrada', tokens: usage?.inputTokens ?? 0 },
    { label: 'Entrada en caché', tokens: usage?.cachedInputTokens ?? 0 },
    { label: 'Salida', tokens: usage?.outputTokens ?? 0 },
    { label: 'Razonamiento', tokens: usage?.reasoningTokens ?? 0 },
  ].filter((s) => s.tokens > 0);
  return (
    <Box data-slot="aui-context-display-detail" sx={(t) => ({ width: t.spacing(DETAIL_WIDTH) })}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={3} sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="caption" sx={(t) => ({ color: labelToneOf(t, severity) })}>{Math.round(percent)}% lleno</Typography>
        <Typography variant="caption" sx={monoSx}>{formatTokenCount(Math.min(totalTokens, modelContextWindow))} / {formatTokenCount(modelContextWindow)}</Typography>
      </Stack>
      <Box sx={(t) => ({ mt: 1.25, height: t.spacing(DETAIL_BAR_HEIGHT), borderRadius: t.spacing(DETAIL_BAR_HEIGHT), bgcolor: 'action.selected', overflow: 'hidden' })}>
        <Box
          sx={(t) => ({
            height: '100%', width: `${percent}%`, minWidth: totalTokens > 0 ? t.spacing(DETAIL_BAR_HEIGHT) : 0, borderRadius: 'inherit', bgcolor: toneOf(t, severity),
            transition: t.transitions.create('width', { duration: t.transitions.duration.standard }), [REDUCED_MOTION]: { transition: 'none' },
          })}
        />
      </Box>
      {segments.length > 0 && (
        <Stack spacing={0.75} sx={{ mt: 1.5 }}>
          {segments.map((s) => (
            <Stack key={s.label} direction="row" justifyContent="space-between" alignItems="baseline" spacing={3}>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              <Typography variant="caption" sx={monoSx}>{formatTokenCount(s.tokens)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export interface AuiContextDisplayTriggerProps {
  side?: AuiContextSide;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

/** El disparador con su detalle en un tooltip (en MUI el contenido va con el disparador). */
export function AuiContextDisplayTrigger({ side = 'top', sx, children }: AuiContextDisplayTriggerProps) {
  return (
    <Tooltip
      placement={side as TooltipProps['placement']}
      title={<AuiContextDisplayDetail />}
      slotProps={{
        popper: { modifiers: [{ name: 'offset', options: { offset: [0, DETAIL_OFFSET] } }] },
        tooltip: { sx: { bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', boxShadow: 2, p: 1.5, maxWidth: 'none' } },
      }}
    >
      <ButtonBase
        data-slot="aui-context-display"
        aria-label="Uso del contexto"
        sx={[
          (t) => ({
            ...t.typography.caption, display: 'inline-flex', alignItems: 'center', borderRadius: 1, color: 'text.secondary',
            transition: t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shortest }),
            '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </ButtonBase>
    </Tooltip>
  );
}

function RingVisual() {
  const { percent, severity } = useContextDisplay();
  return (
    <Box component="svg" aria-hidden width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} sx={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <Box component="circle" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" strokeWidth={RING_STROKE} sx={(t) => ({ stroke: t.palette.action.selected })} />
      <Box
        component="circle" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" strokeWidth={RING_STROKE} strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE}
        sx={(t) => ({
          stroke: toneOf(t, severity), transition: t.transitions.create(['stroke-dashoffset', 'stroke'], { duration: t.transitions.duration.standard }),
          [REDUCED_MOTION]: { transition: 'none' },
        })}
      />
    </Box>
  );
}

export interface AuiContextDisplayPresetProps {
  modelContextWindow: number;
  side?: AuiContextSide;
  /** Uso controlado; sin él, se lee del hilo. */
  usage?: AuiTokenUsage | undefined;
  resetKey?: string | undefined;
  sx?: SxProps<Theme>;
}

/** Anillo con el porcentaje. */
export function AuiContextDisplayRing({ side, sx, ...root }: AuiContextDisplayPresetProps) {
  return (
    <AuiContextDisplayRoot {...root}>
      <AuiContextDisplayTrigger side={side} sx={[{ gap: 0.75, px: 0.75, py: 0.5, '&:hover': { color: 'text.primary' } }, ...(Array.isArray(sx) ? sx : [sx])]}>
        <RingVisual />
        <RingLabel />
      </AuiContextDisplayTrigger>
    </AuiContextDisplayRoot>
  );
}
function RingLabel() {
  const { percent } = useContextDisplay();
  return <Box component="span" sx={monoSx}>{Math.round(percent)}%</Box>;
}

/** Barra con los tokens usados y el porcentaje. */
export function AuiContextDisplayBar({ side, sx, ...root }: AuiContextDisplayPresetProps) {
  return (
    <AuiContextDisplayRoot {...root}>
      <AuiContextDisplayTrigger side={side} sx={[{ gap: 1, px: 1, py: 0.5 }, ...(Array.isArray(sx) ? sx : [sx])]}>
        <BarVisual />
      </AuiContextDisplayTrigger>
    </AuiContextDisplayRoot>
  );
}
function BarVisual() {
  const { percent, totalTokens, severity } = useContextDisplay();
  return (
    <>
      <Box sx={(t) => ({ width: t.spacing(BAR_WIDTH), height: t.spacing(BAR_HEIGHT), borderRadius: t.spacing(BAR_HEIGHT), bgcolor: 'action.selected', overflow: 'hidden' })}>
        <Box
          sx={(t) => ({
            height: '100%', width: `${percent}%`, borderRadius: 'inherit', bgcolor: toneOf(t, severity),
            transition: t.transitions.create('width', { duration: t.transitions.duration.standard }), [REDUCED_MOTION]: { transition: 'none' },
          })}
        />
      </Box>
      <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatTokenCount(totalTokens)} ({Math.round(percent)}%)</Box>
    </>
  );
}

/** Texto «usados / ventana». */
export function AuiContextDisplayText({ side, sx, ...root }: AuiContextDisplayPresetProps) {
  return (
    <AuiContextDisplayRoot {...root}>
      <AuiContextDisplayTrigger side={side} sx={[(t) => ({ ...monoSx(t), px: 1, py: 0.5, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }), ...(Array.isArray(sx) ? sx : [sx])]}>
        <TextVisual />
      </AuiContextDisplayTrigger>
    </AuiContextDisplayRoot>
  );
}
function TextVisual() {
  const { totalTokens, modelContextWindow } = useContextDisplay();
  return <>{formatTokenCount(totalTokens)} / {formatTokenCount(modelContextWindow)}</>;
}
