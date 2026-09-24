// Cosmos DS · Kit IA · Messages: Error state.
// Tablero aprobado «Error state»: un aviso discreto con camino para reintentar, no un modal en tu cara.
// Como en assistant-ui: mientras reintenta, el aviso se cambia por una línea «Reintentando»; si funciona, el aviso desaparece.
// El aviso es un Alert de MUI (severity «error»), con los colores que Cosmos define para él.
import * as React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { CircleAlert, RefreshCw } from 'lucide-react';
import { REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';

export interface ErrorStateProps {
  title: string;
  detail: string;
  /** Mientras reintenta, el aviso se reemplaza por «Reintentando». */
  retrying: boolean;
  onRetry: () => void;
  /** Default 'Reintentar'. */
  retryLabel?: string;
  /** Default 'Reintentando'. */
  retryingLabel?: string;
  className?: string;
}

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;
const enter = (t: Theme) => ({ animation: `${fadein} ${t.transitions.duration.complex}ms ${t.transitions.easing.easeOut}`, [REDUCED_MOTION]: { animation: 'none' } });

export function ErrorState({
  title,
  detail,
  retrying,
  onRetry,
  retryLabel = 'Reintentar',
  retryingLabel = 'Reintentando',
  className,
}: ErrorStateProps) {
  if (retrying) {
    return (
      <Stack key="retrying" role="status" direction="row" alignItems="center" spacing={1} className={className} data-slot="error-state" sx={(t) => ({ px: 2, py: 1.5, ...enter(t) })}>
        <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', color: 'text.secondary', animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } }}>
          <RefreshCw size={16} />
        </Box>
        <Typography component="span" variant="subtitle1" sx={(t) => shimmerTextSx(t)}>{retryingLabel}</Typography>
      </Stack>
    );
  }

  return (
    <Alert
      key="error"
      severity="error"
      icon={<CircleAlert size={18} />}
      className={className}
      data-slot="error-state"
      action={<Button variant="outlined" color="error" onClick={onRetry}>{retryLabel}</Button>}
      sx={enter}
    >
      <AlertTitle>{title}</AlertTitle>
      {detail}
    </Alert>
  );
}
