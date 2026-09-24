// Cosmos DS · Kit IA · Reasoning: Typing indicator.
// Tablero aprobado «Typing indicator»: tres puntos que se leen como presencia, no como ruido,
// justo donde aparecerá la respuesta. Colores y medidas salen del tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type TypingIndicatorVariant = 'bare' | 'bubble';

export interface TypingIndicatorProps {
  /** 'bare' (solo los puntos) o 'bubble' (sobre la superficie gris del mensaje). Default 'bare'. */
  variant?: TypingIndicatorVariant;
  /** Etiqueta accesible. Default 'El asistente está escribiendo'. */
  label?: string;
  className?: string;
}

const bounce = keyframes`0%, 60%, 100% { transform: translateY(0); opacity: .6; } 30% { transform: translateY(-4px); opacity: 1; }`;
const DELAYS = [0, 0.15, 0.3];

export function TypingIndicator({ variant = 'bare', label = 'El asistente está escribiendo', className }: TypingIndicatorProps) {
  const bubble = variant === 'bubble';
  return (
    <Box role="status" aria-label={label} className={className} sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5, borderRadius: 1,
      ...(bubble ? { px: 2, py: 1.5, bgcolor: 'ai.surfaceMuted' } : { p: 0 }),
    }}>
      {DELAYS.map((d) => (
        <Box key={d} component="span" aria-hidden="true" sx={{
          width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary',
          animation: `${bounce} 1.2s ease-in-out ${d}s infinite`, [REDUCED_MOTION]: { animation: 'none' },
        }} />
      ))}
    </Box>
  );
}
