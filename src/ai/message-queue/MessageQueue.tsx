// Cosmos DS · Kit IA · Messages: Message queue.
// Tablero aprobado «Message queue»: lo que escribes mientras una ejecución corre queda en fila,
// y puedes cancelarlo hasta que termine. Como en assistant-ui: la ejecución en curso arriba, la fila debajo,
// y cada mensaje en fila se puede quitar (solo si hay onCancel).
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { ArrowUp, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface QueuedMessage {
  id: string;
  text: string;
}

export interface MessageQueueProps {
  /** Lo que se está ejecutando ahora. Sin él, no hay ejecución activa. */
  running?: string;
  queued: readonly QueuedMessage[];
  /** Quita un mensaje de la fila. Sin él, no se muestra el botón de quitar. */
  onCancel?: (id: string) => void;
  /** Lo pasa al primer lugar de la fila. Sin él, no se muestra el botón. */
  onSendNext?: (id: string) => void;
  className?: string;
}

const pulse = keyframes`0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); }`;
const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;

export function MessageQueue({ running, queued, onCancel, onSendNext, className }: MessageQueueProps) {
  const queuedCount = queued.length;

  return (
    <Stack spacing={1.25} className={className} data-slot="message-queue">
      {running ? (
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            component="span"
            aria-hidden="true"
            sx={{ width: (t) => t.spacing(1), height: (t) => t.spacing(1), flexShrink: 0, borderRadius: '50%', bgcolor: 'primary.main', animation: `${pulse} 1.4s ease-in-out infinite`, [REDUCED_MOTION]: { animation: 'none' } }}
          />
          <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>{running}</Typography>
          <Chip size="small" color="primary" variant="outlined" label="en curso" />
        </Stack>
      ) : (
        <Typography variant="body3" color="text.secondary">Sin ejecución activa. Lo que envíes sale de inmediato.</Typography>
      )}

      {queuedCount > 0 ? (
        <Typography role="status" variant="body3" color="text.secondary">
          {`${queuedCount} en fila · se envía cuando esto termine`}
        </Typography>
      ) : null}

      <Stack component={List} disablePadding spacing={0.75}>
        {queued.map((message) => (
          <ListItem
            key={message.id}
            disableGutters
            sx={(t) => ({
              pl: 1.5,
              pr: 0.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'ai.surfaceMuted',
              animation: `${fadein} ${t.transitions.duration.enteringScreen}ms ${t.transitions.easing.easeOut}`,
              [REDUCED_MOTION]: { animation: 'none' },
            })}
            secondaryAction={
              <Stack direction="row">
                {onSendNext ? (
                  <Tooltip title="Enviar a continuación">
                    <IconButton aria-label={`Enviar a continuación: ${message.text}`} onClick={() => onSendNext(message.id)}>
                      <ArrowUp size={14} />
                    </IconButton>
                  </Tooltip>
                ) : null}
                {onCancel ? (
                  <Tooltip title="Quitar">
                    <IconButton aria-label={`Quitar de la fila: ${message.text}`} onClick={() => onCancel(message.id)}>
                      <X size={14} />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Stack>
            }
          >
            <ListItemText primary={message.text} primaryTypographyProps={{ variant: 'body2', noWrap: true }} />
          </ListItem>
        ))}
      </Stack>
    </Stack>
  );
}
