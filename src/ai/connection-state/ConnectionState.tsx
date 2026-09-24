// Cosmos DS · Kit IA · Thread: Connection state.
// Referente: assistant-ui «Connection state» (elements/connection-state.tsx): se cae la conexión, la ejecución sigue en
// el servidor y el stream se retoma. Una fila por fase sobre la superficie del hilo: «online» no pinta nada; «dropped»
// ofrece Reconectar; «reconnecting» cuenta el intento; «resumed» dice cuántos tokens llegaron mientras tanto.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { Check, CloudOff } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type ConnectionPhase = 'online' | 'dropped' | 'reconnecting' | 'resumed';

export interface ConnectionStateProps {
  phase: ConnectionPhase;
  attempt?: number;
  resumedTokens?: number;
  onRetry?: () => void;
  className?: string;
}

/** Medidas de assistant-ui: max-w-sm, ícono de 14px. */
const MAX_WIDTH = 384;
const ICON_SIZE = 14;
const slideDown = keyframes`from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; }`;
const fmt = (n: number) => n.toLocaleString('es-CO');

export function ConnectionState({ phase, attempt, resumedTokens, onRetry, className }: ConnectionStateProps) {
  if (phase === 'online') return null;
  const meta = (text: string) => <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{text}</Typography>;
  const icon = (node: React.ReactNode, color: string) => <Box component="span" aria-hidden="true" sx={{ display: 'flex', flexShrink: 0, color }}>{node}</Box>;

  return (
    <Paper
      variant="outlined"
      role={phase === 'dropped' ? 'alert' : 'status'}
      data-slot="connection-state"
      data-phase={phase}
      className={className}
      sx={(t) => ({
        width: '100%',
        maxWidth: MAX_WIDTH,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.75,
        py: 1.25,
        animation: `${slideDown} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeOut}`,
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      {phase === 'dropped' ? (
        <>
          {icon(<CloudOff size={ICON_SIZE} />, 'warning.main')}
          <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }}>Se perdió la conexión. La respuesta sigue generándose en el servidor.</Typography>
          {onRetry ? <Button color="inherit" onClick={onRetry} sx={{ flexShrink: 0, color: 'text.secondary' }}>Reconectar</Button> : null}
        </>
      ) : null}
      {phase === 'reconnecting' ? (
        <>
          {icon(<CircularProgress size={ICON_SIZE} color="inherit" thickness={5} />, 'text.disabled')}
          <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }}>Reconectando</Typography>
          {attempt !== undefined ? meta(`intento ${attempt}`) : null}
        </>
      ) : null}
      {phase === 'resumed' ? (
        <>
          {icon(<Check size={ICON_SIZE} />, 'success.main')}
          <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }}>Retomamos la respuesta donde iba.</Typography>
          {resumedTokens !== undefined ? meta(`+${fmt(resumedTokens)} tokens`) : null}
        </>
      ) : null}
    </Paper>
  );
}
