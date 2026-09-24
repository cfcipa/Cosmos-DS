// Cosmos DS · Kit IA · Messages: Feedback dialog.
// Tablero aprobado «Feedback dialog»: un pulgar abajo que pregunta por qué, para que la señal llegue con su razón.
// Como en assistant-ui: motivos de selección múltiple, una nota opcional y, al enviar, un agradecimiento en su lugar.
// La región de estado está montada siempre, para que el lector de pantalla anuncie el agradecimiento.
import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { Check } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface FeedbackDialogProps {
  reasons: readonly string[];
  selected: readonly string[];
  note: string;
  sent: boolean;
  /** Sin él, los motivos se muestran pero no se pueden elegir. */
  onToggleReason?: (reason: string) => void;
  onNoteChange?: (note: string) => void;
  /** Sin él, no se muestra el botón de enviar. */
  onSubmit?: () => void;
  /** Default '¿Qué falló en esta respuesta?'. */
  title?: string;
  /** Default 'Gracias. Lo revisamos con este contexto.'. */
  thanks?: string;
  className?: string;
}

const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;
const enter = (t: Theme) => ({ animation: `${fadein} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`, [REDUCED_MOTION]: { animation: 'none' } });

export function FeedbackDialog({
  reasons,
  selected,
  note,
  sent,
  onToggleReason,
  onNoteChange,
  onSubmit,
  title = '¿Qué falló en esta respuesta?',
  thanks = 'Gracias. Lo revisamos con este contexto.',
  className,
}: FeedbackDialogProps) {
  const titleId = React.useId();

  return (
    <Box className={className} data-slot="feedback-dialog">
      <Box role="status" aria-live="polite">
        {/* role «none»: el anuncio lo hace la región de estado, que ya estaba montada. */}
        {sent ? <Alert severity="success" role="none" icon={<Check size={18} />} sx={enter}>{thanks}</Alert> : null}
      </Box>

      {sent ? null : (
        <Paper variant="outlined" role="group" aria-labelledby={titleId} sx={(t) => ({ p: 2, ...enter(t) })}>
          <Stack spacing={1.5}>
            <Typography id={titleId} variant="subtitle1">{title}</Typography>
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
              {reasons.map((reason) => {
                const isSelected = selected.includes(reason);
                return (
                  <Chip
                    key={reason}
                    label={reason}
                    variant="outlined"
                    color={isSelected ? 'primary' : 'default'}
                    icon={isSelected ? <Check size={16} /> : undefined}
                    // Sin onToggleReason el motivo solo se muestra: sin rol de botón ni estado presionado.
                    aria-pressed={onToggleReason ? isSelected : undefined}
                    onClick={onToggleReason ? () => onToggleReason(reason) : undefined}
                  />
                );
              })}
            </Stack>
            <TextField
              multiline
              minRows={2}
              fullWidth
              size="small"
              value={note}
              placeholder="Cuéntanos más (opcional)"
              inputProps={{ 'aria-label': 'Nota opcional' }}
              onChange={(event) => onNoteChange?.(event.target.value)}
            />
            {onSubmit ? (
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={onSubmit}>Enviar comentario</Button>
              </Stack>
            ) : null}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
