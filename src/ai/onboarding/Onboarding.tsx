// Cosmos DS · Kit IA · Thread: Onboarding.
// Referente: assistant-ui «Onboarding» (elements/onboarding.tsx): primera vez, pasos que enseñan para qué sirve el
// asistente. Controlado: Omitir y Siguiente solo avisan (`onSkip`, `onNext`) y el padre mueve el índice; nada avanza
// solo. En el último paso Siguiente pasa a «Empezar». Cada paso entra con un fundido; el punto activo se alarga.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { fieldSx } from '../lib/thread';

export interface OnboardingStep {
  title: string;
  body: string;
  example: string;
}

export interface OnboardingProps {
  steps: readonly OnboardingStep[];
  index: number;
  onNext?: () => void;
  onSkip?: () => void;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas de assistant-ui: max-w-sm; puntos de 4px, el activo de 16px. */
const MAX_WIDTH = 384;
const DOT = 0.5;
const DOT_ACTIVE = 2;
const fadein = keyframes`from { opacity: 0; } to { opacity: 1; }`;

export function Onboarding({ steps, index, onNext, onSkip, className, sx }: OnboardingProps) {
  if (steps.length === 0) return null;
  const current = Math.max(0, Math.min(steps.length - 1, Math.floor(index)));
  const step = steps[current];
  const last = current >= steps.length - 1;

  return (
    <Paper
      variant="outlined"
      data-slot="onboarding"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, boxSizing: 'border-box', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack key={current} spacing={1} sx={(t) => ({ animation: `${fadein} ${t.transitions.duration.standard}ms`, [REDUCED_MOTION]: { animation: 'none' } })}>
        <Typography variant="caption" color="text.disabled" sx={{ fontVariantNumeric: 'tabular-nums' }}>{`${current + 1} de ${steps.length}`}</Typography>
        <Typography variant="subtitle1" component="h2" sx={{ m: 0 }}>{step.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{step.body}</Typography>
        <Typography variant="body2" color="text.secondary" component="div" sx={{ ...fieldSx(), borderRadius: 1, px: 1.5, py: 1 }}>{step.example}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Stack direction="row" spacing={0.75} aria-hidden="true">
          {steps.map((_, i) => (
            <Box
              key={i}
              sx={(t) => ({
                height: t.spacing(DOT),
                width: t.spacing(i === current ? DOT_ACTIVE : DOT),
                borderRadius: 1,
                bgcolor: i === current ? 'text.secondary' : 'action.disabled',
                transition: t.transitions.create(['width', 'background-color'], { duration: t.transitions.duration.standard }),
                [REDUCED_MOTION]: { transition: 'none' },
              })}
            />
          ))}
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit" onClick={onSkip} sx={{ color: 'text.secondary' }}>Omitir</Button>
        <Button variant="contained" onClick={onNext}>{last ? 'Empezar' : 'Siguiente'}</Button>
      </Stack>
    </Paper>
  );
}
