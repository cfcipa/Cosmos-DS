// Cosmos DS · Kit IA · AUI connected: Tool group.
// Referente: assistant-ui «Tool group» (elements/tool-group.tsx), sobre el ToolGroup del kit: las llamadas seguidas de
// un turno plegadas bajo un solo disparador («N llamadas a herramientas»), con el giro y el brillo mientras alguna corre.
// `AuiToolGroup` va en `components.ToolGroup` de `MessagePrimitive.Parts`; `AuiToolGroupCard` es el resumen estático.
import * as React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { Check, ChevronRight, Loader2, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { ToolGroup, type ToolGroupProps } from '../tool-call';

export type AuiToolGroupVariant = NonNullable<ToolGroupProps['variant']>;

export const toolCallsLabel = (count: number) => (count === 1 ? '1 llamada a herramienta' : `${count} llamadas a herramientas`);

const ICON_SMALL = 12;
const ICON_STATE = 14;
const CARD_MAX_WIDTH = 384;
const spin = keyframes`to { transform: rotate(360deg); }`;

/** Para `components.ToolGroup` de `MessagePrimitive.Parts`: las llamadas seguidas en un grupo outline. */
export function AuiToolGroup({ children, startIndex, endIndex }: React.PropsWithChildren<{ startIndex: number; endIndex: number }>) {
  return <ToolGroup count={endIndex - startIndex + 1}>{children}</ToolGroup>;
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
