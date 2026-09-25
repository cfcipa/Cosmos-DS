// Cosmos DS · Kit IA · Messages: Stopped run.
// Tablero aprobado «Stopped run»: pulsaste detener. La respuesta a medias se queda, y seguir está a un toque.
// Como en assistant-ui: el texto parcial con un cursor al final, el motivo de la detención, Continuar y Descartar.
// Continuar vuelve a generar la respuesta (reload); no la reanuda literalmente.
// `StoppedRunActions` es la fila del motivo y los botones, para ponerla bajo un texto que ya se muestra (el hilo conectado).
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { streamingCaretSx } from '../streaming-text/StreamingText';

/** Los motivos del tablero, en palabras. */
export const STOPPED_RUN_REASONS = { user: 'detenida por ti', length: 'límite de longitud', connection: 'conexión perdida' } as const;

export interface StoppedRunActionsProps {
  /** Motivo de la detención, ya en palabras: «detenida por ti», «límite de longitud». */
  reason: string;
  onContinue?: () => void;
  onDiscard?: () => void;
  className?: string;
}

export interface StoppedRunProps extends StoppedRunActionsProps {
  /** El texto que alcanzó a llegar. */
  text: string;
}

export function StoppedRunActions({ reason, onContinue, onDiscard, className }: StoppedRunActionsProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} className={className} data-slot="stopped-run-actions">
      <Chip size="small" label={reason} sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily, fontSize: t.typography.body3.fontSize, color: 'text.secondary' })} />
      {onContinue ? <Button variant="contained" onClick={onContinue}>Continuar</Button> : null}
      {onDiscard ? <Button variant="text" onClick={onDiscard}>Descartar</Button> : null}
    </Stack>
  );
}

export function StoppedRun({ text, className, ...actions }: StoppedRunProps) {
  return (
    <Stack spacing={1.5} className={className} data-slot="stopped-run">
      <Typography variant="body1">
        {text}
        <Box component="span" aria-hidden="true" sx={streamingCaretSx} />
      </Typography>
      <StoppedRunActions {...actions} />
    </Stack>
  );
}
