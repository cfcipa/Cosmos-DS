// Cosmos DS · Kit IA · Messages: Message actions.
// Tablero aprobado «Message actions»: copiar, calificar y regenerar. Cada acción se confirma con un cambio de estado pequeño.
// Como en assistant-ui: la confirmación ocurre en el propio botón (el ícono de copiar pasa a check, la calificación
// queda marcada, regenerar gira mientras trabaja), no con un aviso aparte.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { keyframes } from '@mui/material/styles';
import { Check, Copy, Ellipsis, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type MessageReaction = 'up' | 'down' | null;

export interface MessageActionsProps {
  /** El texto se acaba de copiar: el ícono pasa a check verde. */
  copied: boolean;
  reaction: MessageReaction;
  /** Regenerar gira y se desactiva mientras trabaja. */
  regenerating: boolean;
  onCopy: () => void;
  /** Recibe la nueva calificación; presionar la misma otra vez la retira (null). */
  onReactionChange: (reaction: MessageReaction) => void;
  onRegenerate: () => void;
  /** Abre el menú «Más acciones»; recibe el botón para anclar el menú de MUI. */
  onMore: (anchor: HTMLElement) => void;
  /** El menú «Más acciones» está abierto (aria-expanded). */
  moreOpen?: boolean;
  className?: string;
}

const ICON_SIZE = 16;

const spin = keyframes`to { transform: rotate(360deg); }`;

export function MessageActions({
  copied,
  reaction,
  regenerating,
  onCopy,
  onReactionChange,
  onRegenerate,
  onMore,
  moreOpen = false,
  className,
}: MessageActionsProps) {
  const reactionSx = (value: Exclude<MessageReaction, null>) => (reaction === value ? { color: 'primary.main' } : undefined);
  const toggleReaction = (value: Exclude<MessageReaction, null>) => onReactionChange(reaction === value ? null : value);

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} className={className} data-slot="message-actions" sx={{ ml: -0.75 }}>
      <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
        <IconButton
          aria-label={copied ? 'Copiado' : 'Copiar respuesta'}
          onClick={onCopy}
          sx={copied ? { color: 'success.main' } : undefined}
        >
          {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Útil">
        <IconButton aria-label="Respuesta útil" aria-pressed={reaction === 'up'} onClick={() => toggleReaction('up')} sx={reactionSx('up')}>
          <ThumbsUp size={ICON_SIZE} />
        </IconButton>
      </Tooltip>

      <Tooltip title="No útil">
        <IconButton aria-label="Respuesta no útil" aria-pressed={reaction === 'down'} onClick={() => toggleReaction('down')} sx={reactionSx('down')}>
          <ThumbsDown size={ICON_SIZE} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Regenerar">
        <span>
          <IconButton aria-label="Regenerar respuesta" disabled={regenerating} onClick={onRegenerate}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                ...(regenerating ? { animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } } : null),
              }}
            >
              <RefreshCw size={ICON_SIZE} />
            </Box>
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Más">
        <IconButton
          aria-label="Más acciones"
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          onClick={(event) => onMore(event.currentTarget)}
         
        >
          <Ellipsis size={ICON_SIZE} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
