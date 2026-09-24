// Cosmos DS · Kit IA · Reasoning: Typing indicator.
// Tablero aprobado «Typing indicator»: tres puntos que se leen como presencia, no como ruido,
// justo donde aparecerá la respuesta. Colores y superficies salen del tema.
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

/** Medidas y tiempos del tablero. */
const DOT_SIZE = 6;
const DOT_COUNT = 3;
/** Cuánto sube cada punto en el rebote, en px. */
const BOUNCE_HEIGHT = 4;
const BOUNCE_DURATION = '1.2s';
/** Retraso entre un punto y el siguiente, en segundos. */
const DOT_STAGGER = 0.15;

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: .6; }
  30% { transform: translateY(-${BOUNCE_HEIGHT}px); opacity: 1; }
`;

export function TypingIndicator({
  variant = 'bare',
  label = 'El asistente está escribiendo',
  className,
}: TypingIndicatorProps) {
  const isBubble = variant === 'bubble';
  const dotDelays = Array.from({ length: DOT_COUNT }, (_, index) => index * DOT_STAGGER);

  return (
    <Box
      role="status"
      aria-label={label}
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        borderRadius: 1,
        ...(isBubble ? { px: 2, py: 1.5, bgcolor: 'ai.surfaceMuted' } : { p: 0 }),
      }}
    >
      {dotDelays.map((delay) => (
        <Box
          key={delay}
          component="span"
          aria-hidden="true"
          sx={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: `${bounce} ${BOUNCE_DURATION} ease-in-out ${delay}s infinite`,
            [REDUCED_MOTION]: { animation: 'none' },
          }}
        />
      ))}
    </Box>
  );
}
