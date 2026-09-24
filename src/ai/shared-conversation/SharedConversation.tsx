// Cosmos DS · Kit IA · Thread: Shared conversation.
// Tablero «Shared conversation»: una transcripción de solo lectura que alguien te envió, con una forma de seguirla tú.
// Como en assistant-ui: título y quién la compartió arriba, los turnos sin controles de edición y, abajo, «Solo lectura»
// y «Continuar en tu propio chat» (solo si llega `onContinue`, que importa los mensajes a un hilo nuevo).
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Link2, Lock } from 'lucide-react';
import { primaryTint } from '../lib/primaryTint';
import { userBubbleSx } from '../lib/thread';

export interface SharedTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface SharedConversationProps {
  title: string;
  sharedBy: string;
  /** Ya formateado: «hace 3 días». */
  sharedAt: string;
  turns: readonly SharedTurn[];
  onContinue?: () => void;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas del tablero. */
const MAX_WIDTH = 448;
const TRANSCRIPT_MAX_HEIGHT = 190;
const ICON_SIZE = 20;
const CHIP_ICON_SIZE = 16;

export function SharedConversation({ title, sharedBy, sharedAt, turns, onContinue, className, sx }: SharedConversationProps) {
  return (
    <Paper
      variant="outlined"
      data-slot="shared-conversation"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <ListItem component="div" divider sx={{ p: 2, flexShrink: 0 }}>
        <ListItemAvatar>
          <Avatar variant="rounded" sx={(t) => ({ bgcolor: primaryTint(t), color: 'primary.main' })}>
            <Link2 size={ICON_SIZE} aria-hidden="true" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={title}
          secondary={`Compartido por ${sharedBy} · ${sharedAt}`}
          primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
          secondaryTypographyProps={{ variant: 'body2', noWrap: true }}
          sx={{ my: 0 }}
        />
      </ListItem>
      <Stack spacing={2} sx={{ p: 2, flexGrow: 1, minHeight: 0, maxHeight: TRANSCRIPT_MAX_HEIGHT, overflowY: 'auto' }}>
        {turns.map((turn) => (
          <Typography key={turn.id} variant="body1" component="div" sx={turn.role === 'user' ? userBubbleSx() : undefined}>
            {turn.text}
          </Typography>
        ))}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
        <Chip size="small" variant="outlined" icon={<Lock size={CHIP_ICON_SIZE} />} label="Solo lectura" />
        <Box sx={{ flexGrow: 1 }} />
        {onContinue ? <Button variant="contained" onClick={onContinue}>Continuar en tu propio chat</Button> : null}
      </Stack>
    </Paper>
  );
}
