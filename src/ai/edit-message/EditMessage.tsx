// Cosmos DS · Kit IA · Messages: Edit a sent message.
// Tablero aprobado «Edit a sent message»: reescribe un turno en su lugar, sabiendo de antemano cuántas respuestas
// descarta la edición. Como en assistant-ui: la burbuja es un botón que abre la edición; al enviar, la versión
// original no se pierde (queda como rama anterior).
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Pencil } from 'lucide-react';

export interface EditMessageProps {
  value: string;
  /** Cuántas respuestas posteriores se descartan al enviar la edición. En 0 no se muestra el aviso. */
  discardedReplies: number;
  editing: boolean;
  onValueChange?: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onStartEdit?: () => void;
  className?: string;
}

const discardWarning = (count: number) => (count === 1 ? 'Al enviar se descarta 1 respuesta' : `Al enviar se descartan ${count} respuestas`);

export function EditMessage({
  value,
  discardedReplies,
  editing,
  onValueChange,
  onSave,
  onCancel,
  onStartEdit,
  className,
}: EditMessageProps) {
  const canSave = value.trim().length > 0;

  if (!editing) {
    return (
      <Box className={className} data-slot="edit-message" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonBase
          onClick={onStartEdit}
          aria-label={`Editar mensaje: ${value}`}
          sx={(t) => ({
            position: 'relative',
            maxWidth: '85%',
            pl: 2,
            pr: 4.5,
            py: 1.5,
            borderRadius: 1,
            bgcolor: 'ai.userBubble',
            color: 'ai.userBubbleText',
            textAlign: 'left',
            ...t.typography.body1,
            '& [data-slot="edit-hint"]': { opacity: 0, transition: t.transitions.create('opacity', { duration: t.transitions.duration.shortest }) },
            '&:hover [data-slot="edit-hint"], &.Mui-focusVisible [data-slot="edit-hint"]': { opacity: 1 },
            '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
          })}
        >
          {value}
          <Box component="span" data-slot="edit-hint" aria-hidden="true" sx={{ position: 'absolute', top: (t) => t.spacing(1), right: (t) => t.spacing(1), display: 'inline-flex', color: 'primary.main' }}>
            <Pencil size={14} />
          </Box>
        </ButtonBase>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" className={className} data-slot="edit-message" sx={{ p: 1.5, borderColor: 'primary.main', borderWidth: 2 }}>
      <Stack spacing={1}>
        <TextField
          autoFocus
          multiline
          minRows={2}
          fullWidth
          variant="standard"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (canSave) onSave?.(); }
            if (event.key === 'Escape') onCancel?.();
          }}
          inputProps={{ 'aria-label': 'Mensaje editado' }}
          InputProps={{ disableUnderline: true }}
        />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body3" color="error.main" sx={{ flexGrow: 1 }}>
            {discardedReplies > 0 ? discardWarning(discardedReplies) : null}
          </Typography>
          <Button variant="text" onClick={onCancel}>Cancelar</Button>
          <Button variant="contained" disabled={!canSave} onClick={onSave}>Enviar</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
