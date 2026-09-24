// Cosmos DS · Kit IA · Reasoning: Thinking indicator.
// Tablero aprobado «Thinking indicator»: una línea viva que nombra lo que el asistente hace ahora mismo,
// con el tiempo transcurrido. Colores y tipografía salen del tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

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

const shimmer = keyframes`from { background-position: 100% 0; } to { background-position: -100% 0; }`;
const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;
const pulse = keyframes`0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); }`;
const exhaust = keyframes`0% { transform: translateX(0) scale(1); opacity: .8; } 100% { transform: translateX(-14px) scale(.35); opacity: 0; }`;
const thrust = keyframes`0%, 100% { transform: translateX(0); } 50% { transform: translateX(1px); }`;
const REDUCED = '@media (prefers-reduced-motion: reduce)';

function Boost() {
  return (
    <Box component="span" aria-hidden="true" sx={{ position: 'relative', width: 22, height: 8, flexShrink: 0 }}>
      {[0, 0.3, 0.6].map((d) => (
        <Box key={d} component="span" sx={{ position: 'absolute', right: 3, top: 2.5, width: 3, height: 3, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0,
          animation: `${exhaust} .9s linear ${d}s infinite`, [REDUCED]: { animation: 'none' } }} />
      ))}
      <Box component="span" sx={(t) => ({ position: 'absolute', right: 0, top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main',
        boxShadow: `0 0 6px 0 ${t.palette.primary.main}73`, animation: `${thrust} .3s ease-in-out infinite`, [REDUCED]: { animation: 'none' } })} />
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
        fontSize: 14, lineHeight: '20px', fontWeight: 500,
        color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundSize: '200% 100%',
        backgroundImage: `linear-gradient(90deg, ${t.palette.text.secondary} 0%, ${t.palette.text.secondary} 35%, ${t.palette.text.disabled} 50%, ${t.palette.text.secondary} 65%, ${t.palette.text.secondary} 100%)`,
        animation: `${fadein} .3s ease-out, ${shimmer} 2s linear infinite`,
        [REDUCED]: { color: t.palette.text.secondary, backgroundImage: 'none', animation: 'none' },
      })}>{label}</Box>
      {elapsed ? (
        <Box component="span" sx={(t) => ({ height: 20, display: 'inline-flex', alignItems: 'center', px: 0.75, borderRadius: 1, bgcolor: 'action.selected',
          ...t.aiKit.code, fontSize: 12, lineHeight: '16px', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' })}>{elapsed}</Box>
      ) : null}
    </Box>
  );
}
