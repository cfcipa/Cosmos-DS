// Cosmos DS · Kit IA · AUI connected: Message timing.
// Referente: assistant-ui «Message timing» (elements/message-timing.aui.tsx y message-timing.tsx).
// Las estadísticas del streaming del mensaje: primer token, tiempo total, velocidad y fragmentos. `AuiMessageTiming` es
// la insignia de la barra de acciones: no aparece hasta que el mensaje termina y muestra el detalle al pasar el cursor
// o al llegar con Tab. `AuiMessageTimingStats` es el pie siempre visible, con los valores en primario mientras llega.
import * as React from 'react';
import { useMessageTiming, type MessageTiming } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';

/** Ancho mínimo del detalle (min-w-35 de assistant-ui) y separación del disparador. */
const DETAIL_MIN_WIDTH = 140;
const DETAIL_OFFSET = 8;
/** El pie ocupa como mucho 384px (max-w-sm). */
const STATS_MAX_WIDTH = 384;
const SECOND = 1000;

const decimal = (n: number, digits: number) => n.toFixed(digits).replace('.', ',');

/** «420 ms» bajo un segundo, «2,35 s» desde ahí; «—» sin dato. */
export function formatTimingMs(ms: number | undefined): string {
  if (ms === undefined) return '—';
  if (ms < SECOND) return `${Math.round(ms)} ms`;
  return `${decimal(ms / SECOND, 2)} s`;
}

export interface AuiTimingStat {
  label: string;
  value: string;
}

/** Las filas del detalle a partir del timing del runtime. `short` usa las etiquetas compactas del pie. */
export function auiTimingStats(timing: MessageTiming | undefined, short = false): AuiTimingStat[] {
  if (!timing) return [];
  const rows: AuiTimingStat[] = [];
  if (timing.firstTokenTime !== undefined) rows.push({ label: short ? 'ttft' : 'Primer token', value: formatTimingMs(timing.firstTokenTime) });
  rows.push({ label: short ? 'total' : 'Total', value: formatTimingMs(timing.totalStreamTime) });
  if (timing.tokensPerSecond !== undefined) {
    const speed = decimal(timing.tokensPerSecond, 1);
    rows.push(short ? { label: 'tok/s', value: speed } : { label: 'Velocidad', value: `${speed} tok/s` });
  }
  rows.push({ label: short ? 'fragmentos' : 'Fragmentos', value: String(timing.totalChunks) });
  return rows;
}

const monoSx = (t: Theme) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' });

export interface AuiMessageTimingProps {
  /** Lado del detalle respecto a la insignia. Default 'right'. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  sx?: SxProps<Theme>;
}

/** La insignia con el tiempo total. Va dentro de `ActionBarPrimitive.Root` para ocultarse con la barra. */
export function AuiMessageTiming({ side = 'right', sx }: AuiMessageTimingProps) {
  const timing = useMessageTiming();
  if (timing?.totalStreamTime === undefined) return null;
  const rows = auiTimingStats(timing);
  return (
    <Tooltip
      placement={side as TooltipProps['placement']}
      describeChild
      title={
        <Stack spacing={0.75} sx={{ minWidth: DETAIL_MIN_WIDTH }} data-slot="aui-message-timing-detail">
          {rows.map((row) => (
            <Stack key={row.label} direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="caption" color="text.secondary">{row.label}</Typography>
              <Typography variant="caption" sx={monoSx}>{row.value}</Typography>
            </Stack>
          ))}
        </Stack>
      }
      slotProps={{
        popper: { modifiers: [{ name: 'offset', options: { offset: [0, DETAIL_OFFSET] } }] },
        tooltip: { sx: { bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', boxShadow: 2, px: 1.5, py: 1, maxWidth: 'none' } },
      }}
    >
      <ButtonBase
        data-slot="aui-message-timing"
        aria-label="Tiempos del mensaje"
        sx={[
          (t) => ({
            ...t.typography.caption, ...monoSx(t), p: 0.5, borderRadius: 1, color: 'text.secondary',
            transition: t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shortest }),
            '&:hover, &.Mui-focusVisible': { bgcolor: 'action.hover', color: 'text.primary' },
            '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {formatTimingMs(timing.totalStreamTime)}
      </ButtonBase>
    </Tooltip>
  );
}

export interface AuiMessageTimingStatsProps {
  stats: readonly AuiTimingStat[];
  /** Valores en primario mientras el mensaje llega. */
  streaming?: boolean;
  sx?: SxProps<Theme>;
}

/** El pie de estadísticas, siempre visible. */
export function AuiMessageTimingStats({ stats, streaming, sx }: AuiMessageTimingStatsProps) {
  return (
    <Box
      data-slot="aui-message-timing-stats"
      sx={[{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 1.5, rowGap: 0.5, width: '100%', maxWidth: STATS_MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {stats.map((stat) => (
        <Box key={stat.label} component="span" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography component="span" variant="caption" color="text.disabled" sx={monoSx}>{stat.label}</Typography>
          <Typography component="span" variant="caption" color={streaming ? 'primary.main' : 'text.secondary'} sx={monoSx}>{stat.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/** El pie conectado al mensaje actual: aparece al llegar el primer token y se va rellenando. */
export function AuiMessageTimingFooter({ sx }: { sx?: SxProps<Theme> }) {
  const timing = useMessageTiming();
  if (!timing) return null;
  // Mientras llega, el total es lo que va del streaming (se actualiza con cada fragmento).
  const streaming = timing.totalStreamTime === undefined;
  const live = streaming ? { ...timing, totalStreamTime: Date.now() - timing.streamStartTime } : timing;
  return <AuiMessageTimingStats stats={auiTimingStats(live, true)} streaming={streaming} sx={sx} />;
}
