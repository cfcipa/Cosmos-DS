// Cosmos DS · Kit IA · Thread: Onboarding.
// Tablero «Onboarding»: primera vez, tres pasos que enseñan para qué sirve de verdad este asistente.
// Como en assistant-ui: controlado; los botones solo avisan (`onNext`, `onSkip`) y el padre mueve el índice. Nada
// avanza solo. En el último paso Siguiente pasa a «Empezar». Cada paso entra con un leve ascenso.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { paletteScale } from '../lib/paletteScale';
import { riseSx } from '../lib/thread';
import { REDUCED_MOTION } from '../lib/shimmerText';

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

const MAX_WIDTH = 400;

export function Onboarding({ steps, index, onNext, onSkip, className, sx }: OnboardingProps) {
  if (steps.length === 0) return null;
  const current = Math.max(0, Math.min(steps.length - 1, Math.floor(index)));
  const step = steps[current];
  const last = current === steps.length - 1;

  return (
    <Paper
      variant="outlined"
      data-slot="onboarding"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{`${current + 1} de ${steps.length}`}</Typography>
        <Stack direction="row" aria-hidden="true">
          {steps.map((_, i) => (
            <Box
              key={i}
              sx={(t) => ({
                width: t.spacing(1),
                height: t.spacing(1),
                mx: 0.25,
                borderRadius: '50%',
                bgcolor: i === current ? 'primary.main' : 'action.disabled',
                transition: t.transitions.create('background-color', { duration: t.transitions.duration.shorter }),
                [REDUCED_MOTION]: { transition: 'none' },
              })}
            />
          ))}
        </Stack>
      </Stack>
      <Stack key={current} spacing={1} sx={(t) => riseSx(t)}>
        <Typography variant="h5" component="h2" sx={{ m: 0 }}>{step.title}</Typography>
        <Typography variant="body1" color="text.secondary">{step.body}</Typography>
        <Typography
          variant="body1"
          component="div"
          sx={(t) => ({ mt: 0.5, px: 1.5, py: 1, borderRadius: 1, bgcolor: t.palette.mode === 'dark' ? t.palette.action.hover : paletteScale(t, 'primary', 50) })}
        >
          {step.example}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button onClick={onSkip}>Omitir</Button>
        <Button variant="contained" onClick={onNext}>{last ? 'Empezar' : 'Siguiente'}</Button>
      </Stack>
    </Paper>
  );
}
