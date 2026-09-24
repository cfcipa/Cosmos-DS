// Cosmos DS · Kit IA · Messages: Stopped run.
// Tablero aprobado «Stopped run»: pulsaste detener. La respuesta a medias se queda, y seguir está a un toque.
// Como en assistant-ui: el texto parcial con un cursor al final, el motivo de la detención, Continuar y Descartar.
// Continuar vuelve a generar la respuesta (reload); no la reanuda literalmente.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface StoppedRunProps {
  /** El texto que alcanzó a llegar. */
  text: string;
  /** Motivo de la detención, ya en palabras: «detenida por ti», «límite de longitud». */
  reason: string;
  onContinue?: () => void;
  onDiscard?: () => void;
  className?: string;
}

const blink = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0; }`;

export function StoppedRun({ text, reason, onContinue, onDiscard, className }: StoppedRunProps) {
  return (
    <Stack spacing={1.5} className={className} data-slot="stopped-run">
      <Typography component="p" variant="body1" sx={{ m: 0 }}>
        {text}
        <Box
          component="span"
          aria-hidden="true"
          sx={{ display: 'inline-block', width: 2, height: '1em', ml: 0.25, verticalAlign: 'text-bottom', bgcolor: 'primary.main', animation: `${blink} 1s steps(2) infinite`, [REDUCED_MOTION]: { animation: 'none' } }}
        />
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip size="small" label={reason} sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.body3.fontSize })} />
        {onContinue ? <Button variant="contained" onClick={onContinue}>Continuar</Button> : null}
        {onDiscard ? <Button variant="text" onClick={onDiscard}>Descartar</Button> : null}
      </Stack>
    </Stack>
  );
}
