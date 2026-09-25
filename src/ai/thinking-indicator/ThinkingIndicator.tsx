// Cosmos DS · Kit IA · Reasoning: Thinking indicator.
// Tablero aprobado «Thinking indicator»: una línea viva que nombra lo que el asistente hace ahora mismo,
// con el tiempo transcurrido. Colores y tipografía salen del tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import { alpha, keyframes } from '@mui/material/styles';
import { REDUCED_MOTION as REDUCED, shimmer, shimmerTextSx } from '../lib/shimmerText';

export type ThinkingIndicatorAnimation = 'boost' | 'pulse';

export interface ThinkingIndicatorProps {
  /** Lo que el asistente hace ahora: «Thinking», «Running consultar_anticipos». Al cambiar, entra con un fundido. */
  label: string;
  /** 'boost' (punto con estela) o 'pulse' (punto que respira). Default 'boost'. */
  animation?: ThinkingIndicatorAnimation;
  /** Tiempo transcurrido ya formateado («12s», «1m 05s»). Sin él, no se muestra. */
  elapsed?: string;
  className?: string;
}

const SECOND_MS = 1000;
const MINUTE_S = 60;

/** El tiempo del tablero: «12s», «1m 05s». */
export function formatThinkingElapsed(ms: number) {
  const s = Math.floor(ms / SECOND_MS);
  return s < MINUTE_S ? `${s}s` : `${Math.floor(s / MINUTE_S)}m ${String(s % MINUTE_S).padStart(2, '0')}s`;
}

/** El tiempo transcurrido mientras `active`, ya formateado; cuenta desde que se activa. */
export function useThinkingElapsed(active: boolean) {
  const [ms, setMs] = React.useState(0);
  React.useEffect(() => {
    if (!active) return undefined;
    const start = Date.now();
    setMs(0);
    const id = window.setInterval(() => setMs(Date.now() - start), SECOND_MS);
    return () => window.clearInterval(id);
  }, [active]);
  return formatThinkingElapsed(ms);
}

const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;
const pulse = keyframes`0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); }`;
const exhaust = keyframes`0% { transform: translateX(0) scale(1); opacity: .8; } 100% { transform: translateX(-14px) scale(.35); opacity: 0; }`;
const thrust = keyframes`0%, 100% { transform: translateX(0); } 50% { transform: translateX(1px); }`;

function Boost() {
  return (
    <Box component="span" aria-hidden="true" sx={{ position: 'relative', width: 22, height: 8, flexShrink: 0 }}>
      {[0, 0.3, 0.6].map((d) => (
        <Box key={d} component="span" sx={{ position: 'absolute', right: 3, top: 2.5, width: 3, height: 3, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0,
          animation: `${exhaust} .9s linear ${d}s infinite`, [REDUCED]: { animation: 'none' } }} />
      ))}
      <Box component="span" sx={(t) => ({ position: 'absolute', right: 0, top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main',
        boxShadow: `0 0 6px 0 ${alpha(t.palette.primary.main, 0.45)}`, animation: `${thrust} .3s ease-in-out infinite`, [REDUCED]: { animation: 'none' } })} />
    </Box>
  );
}

function Pulse() {
  return (
    <Box component="span" aria-hidden="true" sx={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', bgcolor: 'primary.main',
      animation: `${pulse} 1.4s ease-in-out infinite`, [REDUCED]: { animation: 'none' } }} />
  );
}

export function ThinkingIndicator({ label, animation = 'boost', elapsed, className }: ThinkingIndicatorProps) {
  return (
    <Box role="status" aria-live="polite" className={className} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minHeight: 24 }}>
      {animation === 'boost' ? <Boost /> : <Pulse />}
      <Box key={label} component="span" sx={(t) => ({
        fontSize: 14, lineHeight: '20px', fontWeight: t.typography.fontWeightMedium,
        ...shimmerTextSx(t, `${fadein} .3s ease-out, ${shimmer} 2s linear infinite`),
      })}>{label}</Box>
      {elapsed ? (
        <Box component="span" sx={(t) => ({ height: 20, display: 'inline-flex', alignItems: 'center', px: 0.75, borderRadius: 1, bgcolor: 'action.selected',
          ...t.aiKit.code, fontSize: t.typography.body3.fontSize, lineHeight: t.typography.body3.lineHeight, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' })}>{elapsed}</Box>
      ) : null}
    </Box>
  );
}
