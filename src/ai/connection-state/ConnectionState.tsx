// Cosmos DS · Kit IA · Thread: Connection state.
// Tablero «Connection state»: se cae la conexión, la ejecución sigue en el servidor y el stream se retoma.
// Como en assistant-ui: una fase por aviso. «online» no pinta nada; «dropped» ofrece Reconectar; «reconnecting» cuenta
// el intento; «resumed» dice cuántos tokens llegaron mientras tanto (el padre lo retira a los 2 s).
// Alert de MUI con los colores que Cosmos define para error, info y success.
import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { CircleCheck, WifiOff } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type ConnectionPhase = 'online' | 'dropped' | 'reconnecting' | 'resumed';

export interface ConnectionStateProps {
  phase: ConnectionPhase;
  attempt?: number;
  resumedTokens?: number;
  onRetry?: () => void;
  className?: string;
}

const ICON_SIZE = 20;
const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;
const fmt = (n: number) => n.toLocaleString('es-CO');

export function ConnectionState({ phase, attempt, resumedTokens, onRetry, className }: ConnectionStateProps) {
  if (phase === 'online') return null;
  const meta = (text: string) => (
    <Typography variant="body2" sx={{ pr: 1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{text}</Typography>
  );
  const content = {
    dropped: {
      severity: 'error' as const,
      role: 'alert',
      icon: <WifiOff size={ICON_SIZE} />,
      message: 'Se perdió la conexión. La respuesta sigue generándose en el servidor.',
      action: onRetry ? <Button color="inherit" onClick={onRetry}>Reconectar</Button> : null,
    },
    reconnecting: {
      severity: 'info' as const,
      role: 'status',
      icon: <CircularProgress size={ICON_SIZE} color="inherit" />,
      message: 'Reconectando…',
      action: attempt !== undefined ? meta(`Intento ${attempt}`) : null,
    },
    resumed: {
      severity: 'success' as const,
      role: 'status',
      icon: <CircleCheck size={ICON_SIZE} />,
      message: 'Conexión recuperada. Retomamos la respuesta donde iba.',
      action: resumedTokens !== undefined ? meta(`+${fmt(resumedTokens)} tokens`) : null,
    },
  }[phase];

  return (
    <Alert
      key={phase}
      severity={content.severity}
      role={content.role}
      icon={content.icon}
      action={content.action}
      data-slot="connection-state"
      data-phase={phase}
      className={className}
      sx={(t) => ({
        alignItems: 'center',
        '& .MuiAlert-action': { alignItems: 'center', pt: 0 },
        animation: `${fadein} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`,
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      {content.message}
    </Alert>
  );
}
