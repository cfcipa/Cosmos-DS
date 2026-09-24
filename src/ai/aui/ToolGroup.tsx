// Cosmos DS · Kit IA · AUI connected: Tool group.
// Referente: assistant-ui «Tool group» (elements/tool-group.aui.tsx y tool-group.tsx).
// Un contenedor plegable para las llamadas a herramientas seguidas de un turno: «N llamadas a herramientas», con giro y
// brillo mientras alguna corre, y dentro cada llamada (Tool fallback) entrando escalonada. Variantes outline, ghost
// (la del hilo) y muted. `AuiToolGroupCard` es el resumen estático: una tarjeta con el conteo (2/3, 1 falló, 3 listas)
// y, abierta, una fila por herramienta con su objetivo y duración.
import * as React from 'react';
import { useScrollLock } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, useTheme, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { Check, ChevronDown, ChevronRight, Loader, Loader2, X } from 'lucide-react';
import { COLLAPSE_EASE, REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';

export type AuiToolGroupVariant = 'outline' | 'ghost' | 'muted';

/** Medidas de assistant-ui: íconos de 12px, giro de 0,6 s; cada llamada entra 40 ms después de la anterior (hasta 160 ms). */
const ICON_SMALL = 12;
const ICON_STATE = 14;
const SPIN_MS = 600;
const STAGGER_MS = 40;
const STAGGER_MAX = 4;
/** La tarjeta estática: 384px de ancho. */
const CARD_MAX_WIDTH = 384;

/** El retraso de cada llamada del grupo: la 2.ª a 40 ms, la 3.ª a 80 ms… desde la 5.ª, 160 ms. */
const STAGGER_SX: Record<string, { animationDelay: string }> = Object.fromEntries(Array.from({ length: STAGGER_MAX }, (_, i) => [
  i === STAGGER_MAX - 1 ? `& > *:nth-of-type(n+${i + 2})` : `& > *:nth-of-type(${i + 2})`,
  { animationDelay: `${(i + 1) * STAGGER_MS}ms` },
]));

const spin = keyframes`to { transform: rotate(360deg); }`;
const itemIn = keyframes`from { opacity: 0; transform: translateY(-4px); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; }`;

/** «1 llamada a herramienta», «3 llamadas a herramientas». */
export const toolCallsLabel = (count: number) => (count === 1 ? '1 llamada a herramienta' : `${count} llamadas a herramientas`);

type GroupContext = { open: boolean; setOpen: (open: boolean) => void; variant: AuiToolGroupVariant };
const ToolGroupContext = React.createContext<GroupContext | null>(null);
function useToolGroup() {
  const ctx = React.useContext(ToolGroupContext);
  if (!ctx) throw new Error('AuiToolGroup.* va dentro de AuiToolGroupRoot');
  return ctx;
}

export interface AuiToolGroupRootProps {
  variant?: AuiToolGroupVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

export function AuiToolGroupRoot({ variant = 'outline', open: controlled, onOpenChange, defaultOpen = false, sx, children }: AuiToolGroupRootProps) {
  const theme = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  const lockScroll = useScrollLock(ref, theme.transitions.duration.shorter);
  const [own, setOwn] = React.useState(defaultOpen);
  const open = controlled ?? own;
  const setOpen = React.useCallback((next: boolean) => {
    lockScroll();
    if (controlled === undefined) setOwn(next);
    onOpenChange?.(next);
  }, [lockScroll, controlled, onOpenChange]);
  const value = React.useMemo(() => ({ open, setOpen, variant }), [open, setOpen, variant]);
  return (
    <ToolGroupContext.Provider value={value}>
      <Box
        ref={ref}
        data-slot="aui-tool-group"
        data-variant={variant}
        data-state={open ? 'open' : 'closed'}
        sx={[
          { width: '100%' },
          variant === 'outline' && { border: 1, borderColor: 'divider', borderRadius: 1, py: 1.5 },
          variant === 'muted' && { border: 1, borderColor: 'divider', borderRadius: 1, py: 1.5, bgcolor: 'ai.surfaceMuted' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Box>
    </ToolGroupContext.Provider>
  );
}

export function AuiToolGroupTrigger({ count, active = false }: { count: number; active?: boolean }) {
  const { open, setOpen, variant } = useToolGroup();
  const ghost = variant === 'ghost';
  return (
    <ButtonBase
      data-slot="aui-tool-group-trigger"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      sx={(t) => ({
        display: 'flex', gap: 1, borderRadius: 1, transformOrigin: 'left',
        transition: t.transitions.create(['color', 'transform'], { duration: t.transitions.duration.shortest }),
        '&:active': { transform: 'scale(.98)' },
        '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
        '& > svg': { flexShrink: 0, width: ICON_SMALL, height: ICON_SMALL },
        ...(ghost
          ? { py: 0.75, color: 'text.secondary', '&:hover': { color: 'text.primary' } }
          : { width: '100%', px: 2, color: 'text.primary' }),
        [REDUCED_MOTION]: { transition: 'none' },
      })}
    >
      {active && <Box component={Loader} sx={{ animation: `${spin} ${SPIN_MS}ms linear infinite`, [REDUCED_MOTION]: { animation: 'none' } }} />}
      <Box
        component="span"
        sx={(t) => ({
          ...t.typography.caption, fontWeight: ghost ? undefined : t.typography.fontWeightMedium, textAlign: 'start', flexGrow: ghost ? 0 : 1,
          ...(active ? shimmerTextSx(t) : null),
        })}
      >
        {toolCallsLabel(count)}
      </Box>
      <Box
        component={ChevronDown}
        sx={(t) => ({
          transform: open ? 'none' : 'rotate(-90deg)',
          transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter, easing: COLLAPSE_EASE }),
          [REDUCED_MOTION]: { transition: 'none' },
        })}
      />
    </ButtonBase>
  );
}

export function AuiToolGroupContent({ children }: { children: React.ReactNode }) {
  const { open, variant } = useToolGroup();
  const theme = useTheme();
  const ghost = variant === 'ghost';
  return (
    <Collapse in={open} timeout={theme.transitions.duration.shorter} easing={COLLAPSE_EASE} data-slot="aui-tool-group-content">
      <Stack
        spacing={ghost ? 0.5 : 1}
        sx={(t) => ({
          mt: ghost ? 0.5 : 1.5,
          ...(ghost ? null : { borderTop: 1, borderColor: 'divider', px: 2, pt: 1.5 }),
          '& > *': open ? { animation: `${itemIn} ${t.transitions.duration.shorter}ms ${COLLAPSE_EASE} both` } : null,
          ...STAGGER_SX,
          [REDUCED_MOTION]: { '& > *': { animation: 'none' } },
        })}
      >
        {children}
      </Stack>
    </Collapse>
  );
}

/** Para `components.ToolGroup` de `MessagePrimitive.Parts`: las llamadas seguidas en un grupo outline. */
export function AuiToolGroup({ children, startIndex, endIndex }: React.PropsWithChildren<{ startIndex: number; endIndex: number }>) {
  return (
    <AuiToolGroupRoot>
      <AuiToolGroupTrigger count={endIndex - startIndex + 1} />
      <AuiToolGroupContent>{children}</AuiToolGroupContent>
    </AuiToolGroupRoot>
  );
}

// ——— Resumen estático ———

export type AuiGroupedToolState = 'running' | 'done' | 'failed';
export interface AuiGroupedTool {
  id: string;
  name: string;
  target: string;
  state: AuiGroupedToolState;
  durationMs?: number;
}

export interface AuiToolGroupCardProps {
  label: string;
  tools: readonly AuiGroupedTool[];
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  sx?: SxProps<Theme>;
}

function StateIcon({ state, size }: { state: AuiGroupedToolState; size: number }) {
  if (state === 'running') return <Box component={Loader2} sx={{ width: size, height: size, flexShrink: 0, color: 'text.disabled', animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } }} />;
  if (state === 'failed') return <Box component={X} sx={{ width: size, height: size, flexShrink: 0, color: 'error.main' }} />;
  return <Box component={Check} sx={{ width: size, height: size, flexShrink: 0, color: 'success.main' }} />;
}

const monoSx = (t: Theme) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' });

export function AuiToolGroupCard({ label, tools, open, onOpenChange, sx }: AuiToolGroupCardProps) {
  const running = tools.filter((t) => t.state === 'running').length;
  const failed = tools.filter((t) => t.state === 'failed').length;
  const summary = running > 0 ? `${tools.length - running}/${tools.length}` : failed > 0 ? `${failed} falló` : `${tools.length} listas`;
  const state: AuiGroupedToolState = running > 0 ? 'running' : failed > 0 ? 'failed' : 'done';
  const header = (
    <>
      <Box
        component={ChevronRight}
        sx={(t) => ({
          width: ICON_SMALL, height: ICON_SMALL, flexShrink: 0, color: 'text.disabled', transform: open ? 'rotate(90deg)' : 'none',
          transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter }), [REDUCED_MOTION]: { transition: 'none' },
        })}
      />
      <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>{label}</Typography>
      <Typography variant="caption" color="text.disabled" sx={monoSx}>{summary}</Typography>
      <StateIcon state={state} size={ICON_STATE} />
    </>
  );
  const headerSx = (t: Theme) => ({
    display: 'flex', alignItems: 'center', gap: 1.25, width: '100%', px: 1.75, py: 1.25,
    ...(onOpenChange ? { transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }), '&:hover': { bgcolor: 'action.hover' }, '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: -2 } } : null),
  });
  return (
    <Paper variant="outlined" data-slot="aui-tool-group-card" sx={[{ width: '100%', maxWidth: CARD_MAX_WIDTH, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {onOpenChange ? (
        <ButtonBase aria-expanded={open} onClick={() => onOpenChange(!open)} sx={headerSx}>{header}</ButtonBase>
      ) : (
        <Box sx={headerSx}>{header}</Box>
      )}
      <Collapse in={open}>
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          {tools.map((tool) => (
            <Stack key={tool.id} direction="row" alignItems="center" spacing={1.25} sx={{ px: 1.75, py: 1 }}>
              <StateIcon state={tool.state} size={ICON_SMALL} />
              <Typography variant="caption" color="text.secondary" sx={(t) => ({ ...monoSx(t), flexShrink: 0 })}>{tool.name}</Typography>
              <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>{tool.target}</Typography>
              {tool.durationMs !== undefined && <Typography variant="caption" color="text.disabled" sx={monoSx}>{tool.durationMs} ms</Typography>}
            </Stack>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}
