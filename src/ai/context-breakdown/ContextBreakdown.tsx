// Cosmos DS · Kit IA · Composer: Context breakdown.
// Tablero «Context breakdown»: a dónde se fue la ventana: prompt, herramientas, archivos, conversación y lo que queda.
// Como en assistant-ui: una barra por segmentos (cada uno es un «meter» con su parte del límite) y la leyenda con tokens y
// porcentaje; lo libre solo aparece en la leyenda. Sobre el 85 % el encabezado pasa a ámbar (warning del tema).
import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { paletteScale } from '../lib/paletteScale';

export interface ContextSegment {
  label: string;
  tokens: number;
  /** Color del segmento; si falta, se usa la escala de primary en orden. */
  color?: string;
}

export interface ContextBreakdownProps {
  segments: readonly ContextSegment[];
  limit: number;
  /** Default 'Contexto'. */
  title?: string;
  /** Default 'Libre'. */
  freeLabel?: string;
  className?: string;
}

const WARN_AT = 0.85;
/** Ancho de la columna de porcentaje, en caracteres. */
const PCT_CH = 6;
/** La escala de primary del tablero, de oscuro a claro. */
const SHADES = [900, 500, 400, 300] as const;

const fmt = (n: number) => Math.round(n).toLocaleString('es-CO');
const pct = (n: number, limit: number) => (limit ? `${((n / limit) * 100).toFixed(1).replace('.', ',')}%` : '0%');

export function ContextBreakdown({ segments, limit, title = 'Contexto', freeLabel = 'Libre', className }: ContextBreakdownProps) {
  const headingId = React.useId();
  const used = segments.reduce((sum, segment) => sum + segment.tokens, 0);
  const free = Math.max(0, limit - used);
  const fraction = limit ? used / limit : 0;
  const warn = fraction > WARN_AT;
  const colorOf = (t: Theme, i: number) => segments[i].color ?? paletteScale(t, 'primary', SHADES[Math.min(i, SHADES.length - 1)]);
  const mono = (t: Theme) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' });

  return (
    <Stack spacing={1.5} className={className} data-slot="context-breakdown" role="group" aria-labelledby={headingId}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between">
        <Typography id={headingId} variant="subtitle1">{title}</Typography>
        <Typography variant="body3" color={warn ? 'warning.main' : 'text.secondary'} sx={(t) => ({ ...mono(t), fontWeight: warn ? t.typography.fontWeightBold : undefined })}>
          {`${fmt(used)} / ${fmt(limit)} · ${Math.round(fraction * 100)}%`}
        </Typography>
      </Stack>
      <Stack direction="row" sx={(t) => ({ height: t.spacing(1.25), gap: '2px', borderRadius: 1, overflow: 'hidden', bgcolor: paletteScale(t, 'primary', 50, t.palette.action.hover) })}>
        {segments.map((segment, i) => {
          const width = limit ? Math.min(100, (segment.tokens / limit) * 100) : 0;
          return width >= 0.1 ? (
            <Box
              key={segment.label}
              component="span"
              role="meter"
              aria-label={`${segment.label}: uso del contexto`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(width)}
              aria-valuetext={`${fmt(segment.tokens)} de ${fmt(limit)}`}
              sx={(t) => ({ width: `${width}%`, bgcolor: colorOf(t, i), transition: t.transitions.create('width', { duration: t.transitions.duration.standard }) })}
            />
          ) : null;
        })}
      </Stack>
      <Stack component="ul" spacing={0.75} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {[...segments.map((segment, i) => ({ ...segment, i })), { label: freeLabel, tokens: free, i: -1 }].map((row) => (
          <Stack key={row.label} component="li" direction="row" alignItems="center" spacing={1.25}>
            <Box
              component="span"
              aria-hidden="true"
              sx={(t) => ({
                width: t.spacing(1.25),
                height: t.spacing(1.25),
                flexShrink: 0,
                borderRadius: 0.25,
                ...(row.i < 0 ? { border: 1, borderColor: 'text.disabled', bgcolor: 'background.paper' } : { bgcolor: colorOf(t, row.i) }),
              })}
            />
            <Typography variant="body2" color={row.i < 0 ? 'text.secondary' : 'text.primary'} sx={{ flexGrow: 1 }}>{row.label}</Typography>
            <Typography variant="body3" color="text.secondary" sx={mono}>{fmt(row.tokens)}</Typography>
            <Typography variant="body3" color="text.secondary" sx={(t) => ({ ...mono(t), width: `${PCT_CH}ch`, textAlign: 'right' })}>{pct(row.tokens, limit)}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
